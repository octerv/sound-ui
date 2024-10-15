import { useEffect, useRef, useState } from "react";
import { Content } from "./styled";
import { useDecorationCanvasSetup, useSelectRange } from "../effects.canvas";
import { drawAnnotations, drawSelectedRange } from "../functions.canvas";
import { useScaleContext } from "../contexts/scale";
import { useActionContext } from "../contexts/action";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";
import { CANVAS_PADDING, VERTICAL_SCALE_HEIGHT } from "../constants";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasDecoration = () => {
  const { dataUrl, duration, annotations, classes, confThreshold } =
    useDataContext();
  const {
    contentWidth,
    contentHeight,
    canvasWidth,
    graphWidth,
    zoomLevel,
    scrollLeft,
  } = useScaleContext();
  const graphHeight = contentHeight - CANVAS_PADDING - VERTICAL_SCALE_HEIGHT;
  const { drawn } = useDrawContext();
  const { cursorPosition, selecting, selectedRange, setSelectedRange } =
    useActionContext();
  const [offscreenCanvas, setOffscreenCanvas] =
    useState<HTMLCanvasElement | null>(null);

  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---------- Functions ----------
  const copyCanvas = () => {
    if (!offscreenCanvas) return;
    const mainCtx = canvasRef.current?.getContext("2d");
    let sourceWidth = zoomLevel > 1.0 ? graphWidth : canvasWidth;
    if (mainCtx) {
      mainCtx.clearRect(0, 0, contentWidth, contentHeight);
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

  // ---------- Effects ----------
  useDecorationCanvasSetup(canvasRef, dataUrl);

  useSelectRange(
    selecting,
    cursorPosition,
    zoomLevel,
    drawn,
    canvasRef,
    selectedRange,
    setSelectedRange
  );

  useEffect(() => {
    if (!selecting) return;
    if (duration === 0) return;
    // 選択された範囲を描画する
    drawSelectedRange(
      canvasRef,
      selectedRange,
      cursorPosition,
      selecting,
      zoomLevel
    );
  }, [cursorPosition, selecting]);

  useEffect(() => {
    if (annotations.length === 0) return;
    // 選択された範囲を描画する
    let offscreenCanvas: HTMLCanvasElement | null = null;
    offscreenCanvas = drawAnnotations(
      canvasWidth,
      contentHeight,
      duration,
      annotations,
      classes,
      confThreshold
    );

    setOffscreenCanvas(offscreenCanvas);
  }, [annotations, confThreshold, canvasWidth]);

  useEffect(() => {
    if (!offscreenCanvas) return;
    copyCanvas();
  }, [offscreenCanvas, scrollLeft]);

  // ---------- Render ----------
  return (
    <Content width={contentWidth} height={contentHeight} ref={canvasRef} />
  );
};

export default CanvasDecoration;
