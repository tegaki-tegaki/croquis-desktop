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
import { log } from "./utils";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// TODO: use a frontend framework to organize this a bit, it's going to hit critical mass soon
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
const infiniteDuration = document.querySelector("#infinite-duration");

let selected_folder = "";
let session_active = false;
let interval_ref: number;

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
  log(`${filepath}`);
});

selectFolderButton.addEventListener("click", () => {
  window.electronAPI.selectFolder();
});
window.electronAPI.onSelectedFolder((folder_path: string) => {
  selected_folder = folder_path; // TODO: filter undefined (aborting selection)
  startSessionButton.removeAttribute("disabled");
  selectedFolder.setAttribute("value", `${folder_path}`);
});

imageDurationRange.addEventListener(
  "input",
  (event: Event & { target: HTMLInputElement }) => {
    imageDurationOutput.textContent = `${event.target.value}`;
  }
);

const start_session = () => {
  if (!session_active) {
    log(`start session`);
    session_active = true;
    const folder_path = selectedFolder.getAttribute("value");

    window.electronAPI.selectRandomImage(folder_path);
    const image_duration_ms = parseInt(imageDurationOutput.value) * 1000;
    interval_ref = window.setInterval(() => {
      window.electronAPI.selectRandomImage(folder_path);
    }, image_duration_ms);
  }
};

const stop_session = () => {
  if (session_active) {
    log(`stop session`);
    session_active = false;
    overlay.setAttribute("hidden", "true");

    window.clearInterval(interval_ref);
  }
};

startSessionButton.addEventListener("click", start_session);
window.electronAPI.onStopSession(stop_session);

infiniteDuration.addEventListener(
  "input",
  (event: Event & { target: HTMLInputElement }) => {
    const checked = event.target.checked;

    if (checked) {
      imageDurationRange.setAttribute("disabled", "true");
      imageDurationOutput.innerText = "∞";
    } else {
      imageDurationRange.removeAttribute("disabled");
      imageDurationOutput.innerText = imageDurationRange.value;
    }
  }
);

window.electronAPI.onError((errorObj) => {
  alert(JSON.stringify(errorObj));
});

log('👋 This message is being logged by "renderer.ts", included via Vite');
