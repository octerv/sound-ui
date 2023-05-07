import React from "react";
import { Content } from "./styled";
import { useSetupCoverCanvas } from "../Waves.effects";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  constants: { [key: string]: number };
  audioBuffer: AudioBuffer | null;
  width: number;
  height: number;
}

const CanvasCover = ({
  canvasRef,
  constants,
  audioBuffer,
  width,
  height,
}: Props) => {
  useSetupCoverCanvas(canvasRef, constants, audioBuffer);
  return <Content width={width} height={height} ref={canvasRef} />;
};

export default CanvasCover;
