import React, { useEffect } from "react";
import { log } from "../browser-utils";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Checkbox } from "./Checkbox";

export const Main = () => {
  const folderPathRef = React.useRef<HTMLInputElement>(null);
  const imageDurationRef = React.useRef<HTMLInputElement>(null);
  const infiniteDurationRef = React.useRef<HTMLInputElement>(null);
  const showTimerRef = React.useRef<HTMLInputElement>(null);
  const intervalRef = React.useRef<number>();
  const intervalProgressRef = React.useRef<number>();
  const sessionActive = React.useRef(false);

  const [imageDuration, setImageDuration] = React.useState(30);
  const [infiniteDuration, setInfiniteDuration] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState("");
  const [showImage, setShowImage] = React.useState(false);
  const [showTimer, setShowTimer] = React.useState(true);
  const [folderPath, setFolderPath] = React.useState("");
  const [sessionButtonEnabled, setSessionButtonEnabled] = React.useState(true);
  const [startTime, setStartTime] = React.useState(null);
  const [now, setNow] = React.useState(null);

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
      log(`request start session`);
      set_session(true);

      window.electronAPI.startSession(folderPathRef.current.value);
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

  function start_progress_timer() {
    setStartTime(Date.now());
    setNow(Date.now());

    clearInterval(intervalProgressRef.current);
    intervalProgressRef.current = window.setInterval(() => {
      setNow(Date.now());
    }, 100);
  }

  let secondsPassed = 0;
  if (startTime != null && now != null) {
    secondsPassed = (now - startTime) / 1000;
  }
  let pctPassedOfDuration =
    ((secondsPassed + secondsPassed / imageDuration) / imageDuration) * 100;

  useEffect(() => {
    window.electronAPI.onSelectedFile((file_os_pathname) => {
      console.log({ file_os_pathname });
      setImageSrc(`resource://${file_os_pathname}`);
      setShowImage(true);

      clearInterval(intervalProgressRef.current);
      if (
        !infiniteDurationRef.current.checked &&
        showTimerRef.current.checked
      ) {
        start_progress_timer();
      }
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

    window.electronAPI.onPreflightStartSessionDone(() => {
      log("start session (preflight done)");
      window.electronAPI.selectRandomImage(folderPathRef.current.value);
      set_image_interval();
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
            <details className="cd-details">
              <summary className="cd-text">Settings</summary>
              <div className="cd-details-contents">
                <Checkbox
                  label="Infinite duration"
                  onChange={(event) =>
                    setInfiniteDuration(event.target.checked)
                  }
                  checked={infiniteDuration}
                  ref={infiniteDurationRef}
                />
                <Checkbox
                  label="Show timer"
                  onChange={(event) => setShowTimer(event.target.checked)}
                  checked={showTimer}
                  ref={showTimerRef}
                />
              </div>
            </details>
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
            {!infiniteDuration &&
              showTimer &&
              secondsPassed < imageDuration - 0.1 && (
                <CircularProgressbar
                  className="progress-pie"
                  value={pctPassedOfDuration}
                  strokeWidth={50}
                  styles={buildStyles({
                    backgroundColor: "green",
                    strokeLinecap: "butt",
                    pathColor: "rgba(255, 255, 255, 0.7)",
                    trailColor: "rgba(0, 0, 0, 0.4)",
                    pathTransitionDuration: 0.2,
                    pathTransition: "linear",
                  })}
                />
              )}
          </div>
        )}
      </div>
    </div>
  );
};
