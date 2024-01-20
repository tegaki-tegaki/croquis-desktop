import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItem,
  net,
  protocol,
} from "electron";
import fs from "fs";
import path from "path";
import { selectRandom } from "./utils";

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
        role: "help",
        accelerator: "Esc",
        click: () => {
          BrowserWindow.getFocusedWindow().webContents.send("stop-session");
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
      const filepath = filePaths[0];
      console.log({ filepath });
      event.reply("selected-file", filepath);
    });
  });

  ipcMain.on("select-folder", (event) => {
    const result = dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    result.then(({ canceled, filePaths, bookmarks }) => {
      const filepath = filePaths[0];
      console.log({ filepath });
      event.reply("selected-folder", filepath);
    });
  });

  ipcMain.on("select-random-image", (event, folder_path) => {
    const dir = fs.readdirSync(folder_path, { recursive: true });
    const filepath_within_dir = selectRandom(dir);
    const filepath = `${folder_path}/${filepath_within_dir}`;
    // TODO: re-roll if non image file (eg. .DS_Store)
    console.log({ filepath });
    event.reply("selected-file", filepath);
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  protocol.handle(protocolName, (request) => {
    const url = request.url.replace(`${protocolName}://`, "");
    return net.fetch(`file://${url}`);
  });

  createWindow();
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
