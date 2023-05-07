import React from "react";
import { Content } from "./styled";
import { useCoverCanvasSetup } from "../Waves.effects";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  constants: { [key: string]: number };
  audioBuffer: AudioBuffer | null;
  width: number;
  height: number;
  stereo: boolean | undefined;
}

const CanvasCover = ({
  canvasRef,
  constants,
  audioBuffer,
  width,
  height,
  stereo,
}: Props) => {
  useCoverCanvasSetup(canvasRef, constants, audioBuffer, stereo);
  return <Content width={width} height={height} ref={canvasRef} />;
};

export default CanvasCover;
