import React, { ChangeEvent, useRef, useState } from "react";
import Waves from "../src/Waves";
import { openAudioFile, openJsonFile } from "../src/functions.file";
import { useAudioTime } from "../src/effects.audio";

type Annotation = {
  startTime: number;
  endTime: number;
  label: string;
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
  const [mono, setMono] = useState<boolean>(false);
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
        for (const note of jsonData["notes"]) {
          newAnnotations.push({
            startTime: note[0],
            endTime: note[1],
            label: note[2],
          });
        }
        setAnnotations(newAnnotations);
      }
    });
  };

  const handleNormalize = () => {
    setNormalize(!normalize);
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
      <button onClick={handleNormalize}>
        Normalize ({normalize ? "ON" : "OFF"})
      </button>
      &nbsp;
      <button onClick={() => setScale(1.0)}>Zoom min</button>
      <button onClick={() => setScale(20.0)}>Zoom max</button>
      <br />
      {mono ? (
        <Waves
          dataUrl={dataUrl}
          annotations={annotations}
          width={800}
          height={400}
          samplingLevel={0.01}
          normalize={normalize}
          scale={scale}
          currentTime={currentTime}
          selectable
          mono
        />
      ) : (
        <Waves
          dataUrl={dataUrl}
          annotations={annotations}
          width={800}
          height={400}
          samplingLevel={0.01}
          normalize={normalize}
          scale={scale}
          currentTime={currentTime}
          selectable
        />
      )}
      <div>
        <audio ref={audioRef} controls src={dataUrl}></audio>
        <div>Current Time: {currentTime.toFixed(2)}</div>
      </div>
    </>
  );
};
