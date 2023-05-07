import React, { startTransition, useState } from "react";
import { useEffect } from "react";
import { useSetupWavesCanvas } from "../Waves.effects";
import { Content } from "./styled";
import { normalize } from "path";
import { drawWaves, drawSelectedRanges } from "../Waves.functions";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Interface
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  constants: { [key: string]: number };
  audioBuffer: AudioBuffer | null;
  width: number;
  height: number;
  left: number;
  samplingLevel: number | undefined;
  normalize: boolean;
  drawing: boolean;
  setDrew: (drew: boolean) => void;
  setDrawing: (drawing: boolean) => void;
  setScaling: (scaling: boolean) => void;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasWaves = ({
  canvasRef,
  constants,
  audioBuffer,
  width,
  height,
  left,
  samplingLevel,
  normalize,
  drawing,
  setDrew,
  setDrawing,
  setScaling,
}: Props) => {
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useSetupWavesCanvas(canvasRef);

  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    setDrawing(true);
  }, [audioBuffer]);

  useEffect(() => {
    if (!drawing) return;
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    // draw waves
    startTransition(() => {
      drawWaves(
        audioBuffer,
        canvasRef,
        constants,
        normalize,
        width,
        samplingLevel || 0.001
      );
      console.info("[success] drew");
      setScaling(false);
      setDrawing(false);
      setDrew(true);
    });
  }, [drawing]);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const wavesStyle = { left };
  return (
    <Content width={width} height={height} style={wavesStyle} ref={canvasRef} />
  );
};

export default CanvasWaves;
