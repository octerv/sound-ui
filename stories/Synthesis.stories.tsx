import React, { useState } from "react";
import Synthesis from "../src/Synthesis";
import { FrequencyConfig } from "../src/Synthesis.types";

export default {
  title: "Synthesis",
  component: Synthesis,
};

export const Default = () => {
  const [playing, setPlaying] = useState(-1);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const frequencyConfigs: FrequencyConfig[] = [
    { frequency: 500, volume: 1 },
    { frequency: 1000, volume: 0.5 },
    { frequency: 1500, volume: 0.3 },
    { frequency: 2000, volume: 0.1 },
  ];

  const initAudioContext = () => {
    const newAudioContext = new AudioContext();
    setAudioContext(newAudioContext);
  };

  const controlPlaying = () => {
    setPlaying(playing + 1);
  };

  return (
    <>
      <button onClick={initAudioContext}>init</button>
      <button onClick={controlPlaying}>play</button>
      <Synthesis
        audioContext={audioContext}
        width={800}
        height={800}
        duration={1}
        frequencies={frequencyConfigs}
        playing={playing}
      />
    </>
  );
};
