import React from "react";
import { Content } from "./styled";
import { useCurrentTime } from "../Waves.effects";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  constants: { [key: string]: number };
  audioBuffer: AudioBuffer | null;
  width: number;
  height: number;
  left: number;
  scale: number;
  stereo: boolean | undefined;
  currentTime: number | undefined;
}

const CanvasTimeline = ({
  canvasRef,
  constants,
  audioBuffer,
  width,
  height,
  left,
  scale,
  stereo,
  currentTime,
}: Props) => {
  useCurrentTime(canvasRef, constants, audioBuffer, width, currentTime);
  const wavesStyle = { left };
  return (
    <Content width={width} height={height} style={wavesStyle} ref={canvasRef} />
  );
};

export default CanvasTimeline;
