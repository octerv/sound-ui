import React, { ChangeEvent, useState } from "react";
import Waves from "../src/Waves";

export default {
  title: "Waves",
  component: Waves,
};

export const Default = () => {
  const [dataUrl, setDataUrl] = useState("");
  const [normalize, setNormalize] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // second

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files?.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        if (reader.result) {
          setDataUrl(reader.result.toString());
        }
      },
      false
    );
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleNormalize = () => {
    setNormalize(!normalize);
  };

  return (
    <>
      <input type="file" accept="audio/*" onChange={selectFile} />
      <button onClick={() => setCurrentTime(currentTime - 0.01)}>◀︎</button>
      <button onClick={() => setCurrentTime(currentTime + 0.01)}>▶︎</button>
      <button onClick={handleNormalize}>
        Normalize ({normalize ? "ON" : "OFF"})
      </button>
      <br />
      <Waves
        dataUrl={dataUrl}
        width={800}
        height={400}
        samplingLevel={0.01}
        normalize={normalize}
        currentTime={currentTime}
        selectable
      />
    </>
  );
};

export const Stereo = () => {
  const [dataUrl, setDataUrl] = useState("");
  const [normalize, setNormalize] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files?.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        if (reader.result) {
          setDataUrl(reader.result.toString());
        }
      },
      false
    );
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleNormalize = () => {
    setNormalize(!normalize);
  };

  return (
    <>
      <input type="file" accept="audio/*" onChange={selectFile} />
      <button onClick={handleNormalize}>
        Normalize ({normalize ? "ON" : "OFF"})
      </button>
      <button onClick={() => setCurrentTime(currentTime - 100)}>◀︎</button>
      <button onClick={() => setCurrentTime(currentTime + 100)}>▶︎</button>
      {currentTime / 1000}
      <br />
      <Waves
        dataUrl={dataUrl}
        width={800}
        height={200}
        normalize={normalize}
        selectable
        stereo
        currentTime={currentTime}
      />
    </>
  );
};
