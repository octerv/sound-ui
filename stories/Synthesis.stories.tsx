import React, { useState } from "react";
import Synthesis from "../src/Synthesis";

export default {
  title: "Synthesis",
  component: Synthesis,
};

export const Default = () => {
  const [playing, setPlaying] = useState(-1);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

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
        frequencies={[500, 1000, 1500, 2000]}
        playing={playing}
      />
    </>
  );
};
