import { startTransition, useRef, useState } from "react";
import { useEffect } from "react";
import { Content } from "./styled";
import { useWavesCanvasSetup } from "../effects.canvas";
import {
  drawLine,
  drawText,
  drawWaveStereo,
  drawWaves,
  drawWavesStereoToMono,
} from "../functions.canvas";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";
import {
  CANVAS_PADDING,
  Color,
  DEFAULT_SAMPLING_LEVEL,
  Font,
  VERTICAL_SCALE_HEIGHT,
} from "../constants";
import { getTimeStr } from "../functions.time";

const CanvasWaves = () => {
  const { dataUrl, audioBuffer, numberOfChannels, mono } = useDataContext();
  const {
    contentWidth,
    contentHeight,
    canvasWidth,
    graphWidth,
    scale,
    timeScales,
    scrollLeft,
  } = useScaleContext();
  const graphHeight = contentHeight - CANVAS_PADDING - VERTICAL_SCALE_HEIGHT;
  const { setDrawing, setDrawn } = useDrawContext();
  const [offscreenCanvas, setOffscreenCanvas] =
    useState<HTMLCanvasElement | null>(null);

  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---------- Functions ----------
  const copyCanvas = () => {
    if (!offscreenCanvas) return;
    const mainCtx = canvasRef.current?.getContext("2d");
    let sourceWidth = scale > 1.0 ? graphWidth : canvasWidth;
    if (mainCtx) {
      mainCtx.clearRect(0, 0, contentWidth, contentHeight);
      // メインキャンバスに描画
      mainCtx.drawImage(
        // ソースキャンバス
        offscreenCanvas,
        // ソースキャンバスのサブセクション
        scrollLeft,
        0,
        sourceWidth,
        contentHeight,
        // 描画先キャンバスの位置とサイズ
        CANVAS_PADDING,
        CANVAS_PADDING,
        graphWidth,
        graphHeight
      );
    }
  };

  const drawTimeScales = () => {
    const mainCtx = canvasRef.current?.getContext("2d");
    if (!mainCtx) return;

    for (const timeScale of timeScales) {
      const adjustX =
        scale === 1.0
          ? (timeScale.x / canvasWidth) * graphWidth // 等倍の場合はキャンバスの縮小を考慮
          : timeScale.x - scrollLeft; // 拡大されている場合はスクロール位置を考慮
      drawText(
        mainCtx,
        adjustX + CANVAS_PADDING,
        graphHeight + CANVAS_PADDING + VERTICAL_SCALE_HEIGHT / 2,
        getTimeStr(timeScale.t),
        Font.Small,
        Color.DeepSlate
      );
    }
  };

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
    setOffscreenCanvas(offscreenCanvas);

    console.info(
      `[success] drew, content:${contentWidth}, canvas:${canvasWidth}, scrollLeft:${scrollLeft}`
    );
    setDrawing(false);
    setDrawn(true);
  }, [audioBuffer, numberOfChannels, canvasWidth, mono]);

  useEffect(() => {
    if (!offscreenCanvas) return;
    copyCanvas();
    // 時刻の目盛を描画
    drawTimeScales();
  }, [offscreenCanvas, scrollLeft, timeScales]);

  // ---------- Render ----------
  return (
    <Content width={contentWidth} height={contentHeight} ref={canvasRef} />
  );
};

export default CanvasWaves;
