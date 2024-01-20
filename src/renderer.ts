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

const setButton = document.querySelector("#the-button");
const titleInput = document.querySelector("#the-title");
const selectFileButton = document.querySelector("#select-file-button");
const theImage = document.querySelector("#the-image");

setButton.addEventListener("click", () => {
  const title = titleInput.value;
  window.electronAPI.setTitle(title);
});

selectFileButton.addEventListener("click", () => {
  window.electronAPI.selectFile();
});

window.electronAPI.onSelectedFile((filepath: string) => {
  theImage.setAttribute("src", `resource://${filepath}`);
  console.log(`renderer: ${filepath}`);
});

console.log(
  '👋 This message is being logged by "renderer.ts", included via Vite'
);
