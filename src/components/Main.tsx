import React, { useEffect } from "react";
import { log } from "../browser-utils";

export const Main = () => {
  const [imageDuration, setImageDuration] = React.useState<number>(30);
  const [infiniteDuration, setInfiniteDuration] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState("");
  const [showImage, setShowImage] = React.useState(false);
  const [sessionActive, setSessionActive] = React.useState(false);
  const [folderPath, setFolderPath] = React.useState("");
  const [intervalRef, setIntervalRef] = React.useState<number>();

  useEffect(() => {
    window.electronAPI.onSelectedFile((file_os_pathname) => {
      console.log({ file_os_pathname });
      setImageSrc(`resource://${file_os_pathname}`);
      setShowImage(true);
    });
    window.electronAPI.onStopSession(() => {
      console.log({ sessionActive });
      if (sessionActive) {
        log(`stop session`);
        window.clearInterval(intervalRef);
        setSessionActive(false);
        setShowImage(false);
      }
    });

    window.electronAPI.onError((errorObj) => {
      alert(JSON.stringify(errorObj));
    });

    window.electronAPI.onNextImage(() => {
      if (sessionActive) {
        window.clearInterval(intervalRef);
        window.electronAPI.selectRandomImage(folderPath);
        set_image_interval({
          folderPath,
          imageDuration,
          infiniteDuration,
          setIntervalRef,
        });
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
            />
            <div className="hstack align-center">
              <input
                id="infinite-duration"
                className="cd-checkbox"
                type="checkbox"
                name="infinite-duration"
                checked={infiniteDuration}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setInfiniteDuration(checked);
                }}
              />
              <label
                className="cd-text cd-label--inline"
                htmlFor="infinite-duration"
              >
                Infinite duration
              </label>
            </div>
            <div className="vspace"></div>
            <div className="hstack gap-1">
              <button
                id="start-session-button"
                className="cd-button"
                onClick={() => {
                  if (!sessionActive) {
                    log(`start session`);
                    setSessionActive(true);

                    window.electronAPI.selectRandomImage(folderPath);
                    set_image_interval({
                      folderPath,
                      imageDuration,
                      infiniteDuration,
                      setIntervalRef,
                    });
                  }
                }}
                disabled={folderPath === "" && sessionActive}
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
          </div>
        )}
      </div>
    </div>
  );
};

const set_image_interval = ({
  folderPath,
  imageDuration,
  infiniteDuration,
  setIntervalRef,
}: {
  folderPath: string;
  imageDuration: number;
  infiniteDuration: boolean;
  setIntervalRef: (ref: number) => void;
}) => {
  const image_duration_ms = imageDuration * 1000;
  if (!infiniteDuration) {
    setIntervalRef(
      window.setInterval(() => {
        window.electronAPI.selectRandomImage(folderPath);
      }, image_duration_ms)
    );
  }
};
