import React, { ChangeEvent, useState } from "react";
import { Waves } from "../src/Waves";

export default {
  title: "Waves",
  component: Waves,
};

export const Default = () => {
  const [dataUrl, setDataUrl] = useState("");
  const [normalize, setNormalize] = useState(false);

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
      <br />
      <Waves
        dataUrl={dataUrl}
        width={800}
        height={400}
        samplingLevel={0.01}
        normalize={normalize}
        selectable
      />
    </>
  );
};

export const Stereo = () => {
  const [dataUrl, setDataUrl] = useState("");
  const [normalize, setNormalize] = useState(false);

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
      <br />
      <Waves
        dataUrl={dataUrl}
        width={800}
        height={200}
        samplingLevel={0.01}
        normalize={normalize}
        selectable
        stereo
      />
    </>
  );
};
