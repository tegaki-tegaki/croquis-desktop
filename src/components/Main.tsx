import React, { useEffect } from "react";
import { log } from "../browser-utils";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Checkbox } from "./Checkbox";

export const Main = () => {
  const folderPathRef = React.useRef<HTMLInputElement>(null);
  const imageDurationRef = React.useRef<HTMLInputElement>(null);
  const infiniteDurationRef = React.useRef<HTMLInputElement>(null);
  const intervalRef = React.useRef<number>();
  const sessionActive = React.useRef(false);

  const [imageDuration, setImageDuration] = React.useState(30);
  const [infiniteDuration, setInfiniteDuration] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState("");
  const [showImage, setShowImage] = React.useState(false);
  const [folderPath, setFolderPath] = React.useState("");
  const [sessionButtonEnabled, setSessionButtonEnabled] = React.useState(true);

  const set_image_interval = () => {
    const image_duration_ms = parseInt(imageDurationRef.current.value) * 1000;
    if (!infiniteDurationRef.current.checked) {
      intervalRef.current = window.setInterval(() => {
        window.electronAPI.selectRandomImage(folderPathRef.current.value);
      }, image_duration_ms);
    }
  };

  const set_session = (active: boolean) => {
    sessionActive.current = active;
    setSessionButtonEnabled(!active);
  };

  const start_session = () => {
    if (!sessionActive.current) {
      log(`start session`);
      set_session(true);

      window.electronAPI.selectRandomImage(folderPathRef.current.value);
      set_image_interval();
    }
  };

  const stop_session = () => {
    if (sessionActive.current) {
      log(`stop session`);
      window.clearInterval(intervalRef.current);
      set_session(false);
      setShowImage(false);
    }
  };

  useEffect(() => {
    window.electronAPI.onSelectedFile((file_os_pathname) => {
      console.log({ file_os_pathname });
      setImageSrc(`resource://${file_os_pathname}`);
      setShowImage(true);
    });
    window.electronAPI.onStopSession(() => {
      stop_session();
    });

    window.electronAPI.onError((errorObj) => {
      alert(JSON.stringify(errorObj));
    });

    window.electronAPI.onNextImage(() => {
      if (sessionActive.current) {
        window.clearInterval(intervalRef.current);
        window.electronAPI.selectRandomImage(folderPathRef.current.value);
        set_image_interval();
      }
    });

    window.electronAPI.onSelectedFolder((folder_path) => {
      setFolderPath(folder_path);
    });
  }, []);

  return (
    <div className="page">
      <div className="page-content">
        <div className="card vstack">
          <div className="vstack">
            <button
              id="select-folder-button"
              className="cd-button"
              onClick={() => {
                window.electronAPI.selectFolder();
              }}
            >
              Select folder
            </button>
            <input
              id="display-selected-folder"
              className="cd-input cd-input--long"
              disabled
              readOnly
              value={folderPath}
              ref={folderPathRef}
            />
            <div className="hstack between">
              <label className="cd-text" htmlFor="image-duration">
                image duration
              </label>
              <div>
                <output id="image-duration-output" className="cd-text">
                  {infiniteDuration ? "∞" : imageDuration}
                </output>
                <span className="cd-text">s</span>
              </div>
            </div>
            <input
              id="image-duration"
              className="cd-range"
              name="image-duration"
              type="range"
              step="5"
              min="5"
              max="120"
              value={imageDuration}
              disabled={infiniteDuration}
              onInput={(event) => {
                setImageDuration(parseInt(event.currentTarget.value));
              }}
              ref={imageDurationRef}
            />
            <Checkbox
              label="Infinite duration"
              onChange={(event) => setInfiniteDuration(event.target.checked)}
              ref={infiniteDurationRef}
            />
            <div className="vspace"></div>
            <div className="hstack gap-1">
              <button
                id="start-session-button"
                className="cd-button"
                onClick={() => {
                  start_session();
                }}
                disabled={folderPath === "" || !sessionButtonEnabled}
              >
                Start session
              </button>
              <span className="cd-text">press (esc) to stop</span>
            </div>
          </div>
        </div>
        {showImage && (
          <div id="overlay">
            <img id="the-image" src={imageSrc} />
            <CircularProgressbar
              className="progress-pie"
              value={22}
              strokeWidth={50}
              styles={buildStyles({
                backgroundColor: "green",
                strokeLinecap: "butt",
                pathColor: "rgba(255, 255, 255, 0.8)",
                trailColor: "rgba(0, 0, 0, 0.5)",
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
};
