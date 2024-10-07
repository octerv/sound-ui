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

const CanvasWaves = () => {
  const { dataUrl, audioBuffer, numberOfChannels, mono } = useDataContext();
  const { contentHeight, canvasWidth } = useScaleContext();
  const { setDrawing, setDrawn } = useDrawContext();

  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---------- Effects ----------
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
      let offscreenCanvas: HTMLCanvasElement | null = null;

      if (numberOfChannels === 1) {
        offscreenCanvas = drawWaves(
          audioBuffer,
          canvasWidth,
          contentHeight,
          DEFAULT_SAMPLING_LEVEL
        );
      } else if (mono && numberOfChannels === 2) {
        offscreenCanvas = drawWavesStereoToMono(
          audioBuffer,
          canvasWidth,
          contentHeight,
          DEFAULT_SAMPLING_LEVEL
        );
      } else if (numberOfChannels === 2) {
        offscreenCanvas = drawWaveStereo(
          audioBuffer,
          canvasWidth,
          contentHeight,
          DEFAULT_SAMPLING_LEVEL
        );
      }

      if (offscreenCanvas) {
        const mainCtx = canvasRef.current?.getContext("2d");
        mainCtx?.drawImage(offscreenCanvas, 0, 0);
      }
      console.info("[success] drew");
      setDrawing(false);
      setDrawn(true);
    });
  }, [audioBuffer, numberOfChannels, canvasWidth, mono]);

  // ---------- Render ----------
  return <Content width={canvasWidth} height={contentHeight} ref={canvasRef} />;
};

export default CanvasWaves;
