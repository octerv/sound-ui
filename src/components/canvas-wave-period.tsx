import React, { startTransition, useRef } from "react";
import { useEffect } from "react";
import { useWavesCanvasSetup } from "../Waves.effects";
import { Content } from "./styled";
import { drawWavePeriod } from "../function.wave";
import { getCanvasContext } from "../functions";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Interface
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
interface Props {
  constants: { [key: string]: number };
  audioBuffer: AudioBuffer | null;
  top: number;
  left: number;
  width: number;
  height: number;
  period: number;
  frequency?: number;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasWavePeriod = ({
  constants,
  audioBuffer,
  top,
  left,
  width,
  height,
  period,
  frequency,
}: Props) => {
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Refs
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const canvasRef = useRef<HTMLCanvasElement>(null);
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useWavesCanvasSetup(canvasRef);

  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    const { canvasCtx, canvasWidth, canvasHeight } =
      getCanvasContext(canvasRef);
    // clear
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    // draw waves
    startTransition(() => {
      drawWavePeriod(audioBuffer, canvasRef, constants, period, frequency);
      console.info("[info] success drew");
    });
  }, [canvasRef]);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const wavesStyle = { top, left };
  return (
    <Content width={width} height={height} style={wavesStyle} ref={canvasRef} />
  );
};

export default CanvasWavePeriod;
