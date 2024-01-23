import { log } from "./browser-utils";
import { ElectronAPI } from "./preload";
import "./styles/index.css";
import "./styles/reset.css";
import "./styles/theme.css";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// TODO: use a frontend framework to organize this a bit, it's going to hit critical mass soon
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
const infiniteDuration = document.querySelector(
  "#infinite-duration"
) as HTMLInputElement;

let selected_folder = "";
let session_active = false;
let interval_ref: number;

window.electronAPI.onSelectedFile((file_os_pathname) => {
  theImage.setAttribute("src", `resource://${file_os_pathname}`);
  overlay.classList.remove("hidden");
  log(`${file_os_pathname}`);
});

selectFolderButton.addEventListener("click", () => {
  window.electronAPI.selectFolder();
});
window.electronAPI.onSelectedFolder((folder_path) => {
  selected_folder = folder_path;
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
    set_image_interval(folder_path);
  }
};

const set_image_interval = (folder_path: string) => {
  const image_duration_ms = parseInt(imageDurationOutput.value) * 1000;
  const infinite_duration = infiniteDuration.checked;
  if (!infinite_duration) {
    interval_ref = window.setInterval(() => {
      window.electronAPI.selectRandomImage(folder_path);
    }, image_duration_ms);
  }
};

const stop_session = () => {
  if (session_active) {
    log(`stop session`);
    session_active = false;
    overlay.classList.add("hidden");

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

window.electronAPI.onNextImage(() => {
  if (session_active) {
    window.clearInterval(interval_ref);
    const folder_path = selectedFolder.getAttribute("value");
    window.electronAPI.selectRandomImage(folder_path);
    set_image_interval(folder_path);
  }
});
