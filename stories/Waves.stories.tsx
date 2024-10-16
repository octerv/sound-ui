import React, { ChangeEvent, useRef, useState } from "react";
import Waves from "../src/Waves";
import { openAudioFile, openJsonFile } from "../src/functions.file";
import { useAudioTime } from "../src/effects.audio";
import { MAX_ZOOM_LEVEL } from "../src/constants";

type Annotation = {
  startTime: number;
  endTime: number;
  label: string;
  confidence: number;
};

export default {
  title: "Waves",
  component: Waves,
};

export const Default = () => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [dataUrl, setDataUrl] = useState<string>("");
  const [annotations, setAnnotations] = useState<Annotation[] | undefined>(
    undefined
  );
  const [classes, setClasses] = useState<string[] | undefined>(undefined);
  const [confThreshold, setConfThreshold] = useState<number>(0.0);
  const [mono, setMono] = useState<boolean>(false);
  const [clickable, setClickable] = useState<boolean>(false);
  const [selectable, setSelectable] = useState<boolean>(false);
  const [normalize, setNormalize] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const currentTime = useAudioTime(audioRef);

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    openAudioFile(e).then((newDataUrl) => {
      if (newDataUrl) {
        setDataUrl(newDataUrl);
      }
    });
  };

  const selectJsonFile = (e: ChangeEvent<HTMLInputElement>) => {
    openJsonFile(e).then((jsonData) => {
      if (jsonData) {
        const newAnnotations: Annotation[] = [];
        if ("notes" in jsonData) {
          for (const note of jsonData["notes"]) {
            newAnnotations.push({
              startTime: note[0],
              endTime: note[1],
              label: note[2],
              confidence: note[3],
            });
          }
        } else if ("drums" in jsonData) {
          for (const note of jsonData["drums"]) {
            newAnnotations.push({
              startTime: note[0],
              endTime: note[1],
              label: note[2],
              confidence: note[3],
            });
          }
          setClasses(jsonData["classes"]);
        } else if ("time_intervals" in jsonData) {
          for (const interval of jsonData["time_intervals"]) {
            newAnnotations.push({
              startTime: interval[0],
              endTime: interval[1],
              label: "",
              confidence: 1.0,
            });
          }
        }
        setAnnotations(newAnnotations);
      }
    });
  };

  const handleNormalize = () => {
    setNormalize(!normalize);
  };

  // 再生位置を秒数で指定する関数
  const setPlayPosition = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  // 描画ステータス
  const setUpdateStatus = (status: string) => {
    console.log(`status: ${status}`);
  };

  return (
    <>
      <input type="file" accept="audio/*" onChange={selectFile} />
      <input type="file" accept="application/json" onChange={selectJsonFile} />
      <br />
      <button onClick={() => setMono(!mono)}>
        Mono ({mono ? "ON" : "OFF"})
      </button>
      &nbsp;
      <button onClick={() => setClickable(!clickable)}>
        Clickable ({clickable ? "ON" : "OFF"})
      </button>
      &nbsp;
      <button onClick={() => setSelectable(!selectable)}>
        Selectable ({selectable ? "ON" : "OFF"})
      </button>
      &nbsp;
      <button onClick={handleNormalize}>
        Normalize ({normalize ? "ON" : "OFF"})
      </button>
      <br />
      <button onClick={() => setZoomLevel(1.0)}>Zoom min</button>
      <button onClick={() => setZoomLevel(MAX_ZOOM_LEVEL)}>Zoom max</button>
      <button onClick={() => setZoomLevel(zoomLevel - 1)}>Zoom -</button>
      <button onClick={() => setZoomLevel(zoomLevel + 1)}>Zoom +</button>
      ZoomLevel: {zoomLevel}
      <br />
      <Waves
        dataUrl={dataUrl}
        annotations={annotations}
        classes={classes}
        confThreshold={confThreshold}
        width={800}
        height={400}
        samplingLevel={0.01}
        normalize={normalize}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        currentTime={currentTime}
        {...(clickable && { clickable })}
        {...(selectable && { selectable })}
        {...(mono && { mono })}
        setPlayPosition={setPlayPosition}
        setUpdateStatus={setUpdateStatus}
      />
      <div>
        <label htmlFor="confidenceSlider">
          Confidence: {confThreshold.toFixed(2)}
        </label>
        <input
          id="confidenceSlider"
          type="range"
          min="0.0"
          max="1.0"
          step="0.05"
          value={confThreshold}
          onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
        />
      </div>
      <div>
        <audio ref={audioRef} controls src={dataUrl}></audio>
        <div>Current Time: {currentTime.toFixed(2)}</div>
      </div>
    </>
  );
};
