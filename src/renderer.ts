import { App } from "./components/App";
import { ElectronAPI } from "./preload";
import "./styles/index.css";
import "./styles/reset.css";
import "./styles/theme.css";

import { createRoot } from "react-dom/client";

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const root = createRoot(document.getElementById("app"));
root.render(App());
