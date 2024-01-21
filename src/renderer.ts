/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./styles/reset.css";
import "./styles/theme.css";
import "./styles/index.css";
import { ElectronAPI } from "./preload";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const setButton = document.querySelector("#the-button");
const titleInput = document.querySelector("#the-title") as HTMLInputElement;
const selectFileButton = document.querySelector("#select-file-button");
const selectFolderButton = document.querySelector("#select-folder-button");
const selectedFolder = document.querySelector("#display-selected-folder");
const theImage = document.querySelector("#the-image");
const imageDurationRange = document.querySelector(
  "#image-duration"
) as HTMLInputElement;
const imageDurationOutput = document.querySelector(
  "#image-duration-output"
) as HTMLOutputElement;
const startSessionButton = document.querySelector("#start-session-button");
const overlay = document.querySelector("#overlay");

let session_active = false;

setButton.addEventListener("click", () => {
  const title = titleInput.value;
  window.electronAPI.setTitle(title);
});

selectFileButton.addEventListener("click", () => {
  window.electronAPI.selectFile();
});
window.electronAPI.onSelectedFile((filepath: string) => {
  theImage.setAttribute("src", `resource://${filepath}`);
  overlay.removeAttribute("hidden");
  console.log(`renderer: ${filepath}`);
});

selectFolderButton.addEventListener("click", () => {
  window.electronAPI.selectFolder();
});
window.electronAPI.onSelectedFolder((folder_path: string) => {
  // theImage.setAttribute("src", `resource://${folder_path}`);
  // console.log(`renderer: ${folder_path}`);
  selectedFolder.setAttribute("value", `${folder_path}`);
});

imageDurationRange.addEventListener(
  "input",
  (event: Event & { target: HTMLInputElement }) => {
    imageDurationOutput.textContent = `${event.target.value}`;
  }
);

startSessionButton.addEventListener("click", () => {
  start_session();
});

window.electronAPI.onStopSession(() => {
  stop_session();
});

const start_session = () => {
  console.log(`renderer: start session`);
  session_active = true;
  // window.electronAPI.startSession();
  const folder_path = selectedFolder.getAttribute("value");
  console.log({ folder: folder_path });
  window.electronAPI.selectRandomImage(folder_path);
};

const stop_session = () => {
  console.log(`renderer: stop session`);
  session_active = false;
  overlay.setAttribute("hidden", "true");
};

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
);
