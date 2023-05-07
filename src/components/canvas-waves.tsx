import React from "react";
import { useEffect } from "react";
import { useSetupWavesCanvas } from "../Waves.effects";
import { Content } from "./styled";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  audioBuffer: AudioBuffer | null;
  width: number;
  height: number;
  left: number;
  setDrawing: (drawing: boolean) => void;
}

const CanvasWaves = ({
  canvasRef,
  audioBuffer,
  width,
  height,
  left,
  setDrawing,
}: Props) => {
  useSetupWavesCanvas(canvasRef);
  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    setDrawing(true);
  }, [audioBuffer]);
  const wavesStyle = { left };
  return (
    <Content width={width} height={height} style={wavesStyle} ref={canvasRef} />
  );
};

export default CanvasWaves;
