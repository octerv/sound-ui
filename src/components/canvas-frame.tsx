import React from "react";
import { useRef } from "react";
import { useFrameCanvasSetup, useFrameCanvasUpdate } from "../Waves.effects";
import { Content } from "./styled";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  constants: { [key: string]: number };
  audioBuffer: AudioBuffer | null;
  width: number;
  height: number;
}

const CanvasFrame = ({
  canvasRef,
  constants,
  audioBuffer,
  width,
  height,
}: Props) => {
  useFrameCanvasSetup(canvasRef);
  useFrameCanvasUpdate(canvasRef, constants, audioBuffer);
  return <Content width={width} height={height} ref={canvasRef} />;
};

export default CanvasFrame;
