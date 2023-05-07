import React from "react";
import { useRef } from "react";
import {
  useFrameCanvasSetup,
  useFrameCanvasStereoUpdate,
  useFrameCanvasUpdate,
} from "../Waves.effects";
import { Content } from "./styled";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  constants: { [key: string]: number };
  audioBuffer: AudioBuffer | null;
  width: number;
  height: number;
  stereo: boolean | undefined;
}

const CanvasFrame = ({
  canvasRef,
  constants,
  audioBuffer,
  width,
  height,
  stereo,
}: Props) => {
  useFrameCanvasSetup(canvasRef);
  if (stereo) {
    useFrameCanvasStereoUpdate(canvasRef, constants, audioBuffer);
  } else {
    useFrameCanvasUpdate(canvasRef, constants, audioBuffer);
  }

  return <Content width={width} height={height} ref={canvasRef} />;
};

export default CanvasFrame;
