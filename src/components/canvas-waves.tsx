import { startTransition, useRef } from "react";
import { useEffect } from "react";
import { Content } from "./styled";
import { useWavesCanvasSetup } from "../effects.canvas";
import {
  drawWaveStereo,
  drawWaves,
  drawWavesStereoToMono,
} from "../functions.canvas";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";
import { DEFAULT_SAMPLING_LEVEL } from "../constants";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasWaves = () => {
  const { dataUrl, audioBuffer, numberOfChannels, mono } = useDataContext();
  const { contentHeight, canvasWidth } = useScaleContext();
  const { setDrawing, setDrawn } = useDrawContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useWavesCanvasSetup(canvasRef, dataUrl);

  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    setDrawing(true);
  }, [audioBuffer]);

  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;

    // draw waves
    startTransition(() => {
      if (numberOfChannels === 1) {
        drawWaves(audioBuffer, canvasRef, canvasWidth, DEFAULT_SAMPLING_LEVEL);
      } else if (mono && numberOfChannels === 2) {
        drawWavesStereoToMono(
          audioBuffer,
          canvasRef,
          canvasWidth,
          DEFAULT_SAMPLING_LEVEL
        );
      } else if (numberOfChannels === 2) {
        drawWaveStereo(
          audioBuffer,
          canvasRef,
          canvasWidth,
          DEFAULT_SAMPLING_LEVEL
        );
      }
      console.info("[success] drew");
      setDrawing(false);
      setDrawn(true);
    });
  }, [audioBuffer, numberOfChannels, canvasWidth, mono]);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  return <Content width={canvasWidth} height={contentHeight} ref={canvasRef} />;
};

export default CanvasWaves;
