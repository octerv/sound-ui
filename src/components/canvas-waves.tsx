import React, { startTransition } from "react";
import { useEffect } from "react";
import { useWavesCanvasSetup } from "../Waves.effects";
import { Content } from "./styled";
import { drawWaveStereo, drawWaves } from "../Waves.functions";

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
  stereo: boolean | undefined;
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
  stereo,
  setDrew,
  setDrawing,
  setScaling,
}: Props) => {
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useWavesCanvasSetup(canvasRef);

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
      if (stereo) {
        drawWaveStereo(
          audioBuffer,
          canvasRef,
          constants,
          normalize,
          width,
          samplingLevel || 0.001
        );
      } else {
        drawWaves(
          audioBuffer,
          canvasRef,
          constants,
          normalize,
          width,
          samplingLevel || 0.001
        );
      }
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
