import React, { ChangeEvent, useRef, useState } from "react";
import Waves from "../src/Waves";
import { openAudioFile, openJsonFile } from "../src/functions.file";
import { useAudioTime } from "../src/effects.audio";
import { MAX_SCALE } from "../src/constants";

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
  const [confThreshold, setConfThreshold] = useState<number>(0.0);
  const [mono, setMono] = useState<boolean>(false);
  const [clickable, setClickable] = useState<boolean>(false);
  const [selectable, setSelectable] = useState<boolean>(false);
  const [normalize, setNormalize] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
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
      &nbsp;
      <button onClick={() => setScale(1.0)}>Zoom min</button>
      <button onClick={() => setScale(MAX_SCALE)}>Zoom max</button>
      <br />
      <Waves
        dataUrl={dataUrl}
        annotations={annotations}
        confThreshold={confThreshold}
        width={800}
        height={400}
        samplingLevel={0.01}
        normalize={normalize}
        scale={scale}
        currentTime={currentTime}
        {...(clickable && { clickable })}
        {...(selectable && { selectable })}
        {...(mono && { mono })}
        setPlayPosition={setPlayPosition}
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
