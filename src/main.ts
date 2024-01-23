import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItem,
  net,
  protocol,
  session,
} from "electron";
import fs from "fs";
import { pathToFileURL } from "node:url";
import path from "path";
import { isImage, selectRandom } from "./node-utils";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const protocolName = "resource";
protocol.registerSchemesAsPrivileged([
  { scheme: protocolName, privileges: { bypassCSP: true } },
]);

const menu = new Menu();
menu.append(
  new MenuItem({
    label: "Electron",
    submenu: [
      {
        label: "Stop session",
        accelerator: "Esc",
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.send("stop-session");
        },
      },
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "cmd+q" : "ctrl+q",
        click: () => {
          app.quit();
        },
      },
      {
        label: "Open dev-tools",
        accelerator: process.platform === "darwin" ? "cmd+alt+I" : "ctrl+alt+I",
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
        },
      },
      {
        label: "Next image",
        accelerator: "Right",
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.send("next-image");
        },
      },
    ],
  })
);

Menu.setApplicationMenu(menu);

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.on("set-title", (event, title) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setTitle(title);
  });

  ipcMain.on("select-file", (event) => {
    const result = dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg"] }],
    });

    result.then(({ canceled, filePaths, bookmarks }) => {
      if (!canceled) {
        const filepath = filePaths[0];
        console.log({ filepath });
        event.reply("selected-file", filepath);
      }
    });
  });

  ipcMain.on("select-folder", (event) => {
    const result = dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    result.then(({ canceled, filePaths, bookmarks }) => {
      if (!canceled) {
        const filepath = filePaths[0];
        console.log({ filepath });
        event.reply("selected-folder", filepath);
      }
    });
  });

  ipcMain.on("select-random-image", async (event, folder_path) => {
    let dir;
    try {
      dir = fs.readdirSync(folder_path, { recursive: true });
    } catch (e) {
      console.log(e);
      event.reply("error", `failed to open directory: ${folder_path}`);
      event.reply("stop-session");
      return;
    }
    let filepath_within_dir: string;
    let file_os_pathname: string;
    let filepath: string;
    do {
      filepath_within_dir = selectRandom(dir);
      filepath = `${folder_path}${path.sep}${filepath_within_dir}`;
      const file_url = pathToFileURL(filepath);
      file_os_pathname = decodeURIComponent(file_url.pathname);
    } while (!(await isImage(file_os_pathname)));

    event.reply("selected-file", file_os_pathname);
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
};

app.whenReady().then(() => {
  protocol.handle(protocolName, (request) => {
    const url = request.url.replace(`${protocolName}://`, "");
    return net.fetch(`file://${url}`);
  });

  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": ["default-src 'self' 'unsafe-inline'"],
      },
    });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
