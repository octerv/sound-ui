import { startTransition, useEffect, useRef } from "react";
import { Content } from "./styled";
import { useDecorationCanvasSetup, useSelectRange } from "../effects.canvas";
import { drawAnnotations, drawSelectedRange } from "../functions.canvas";
import { useScaleContext } from "../contexts/scale";
import { useActionContext } from "../contexts/action";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasDecoration = () => {
  const { dataUrl, duration, annotations, classes, confThreshold } =
    useDataContext();
  const { contentHeight, scale, canvasWidth } = useScaleContext();
  const { drawn } = useDrawContext();
  const { cursorPosition, selecting, selectedRange, setSelectedRange } =
    useActionContext();

  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---------- Effects ----------
  useDecorationCanvasSetup(canvasRef, dataUrl);

  useSelectRange(
    selecting,
    cursorPosition,
    scale,
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
      scale
    );
  }, [cursorPosition, selecting]);

  useEffect(() => {
    if (annotations.length === 0) return;
    // 選択された範囲を描画する
    startTransition(() => {
      let offscreenCanvas: HTMLCanvasElement | null = null;
      offscreenCanvas = drawAnnotations(
        canvasWidth,
        contentHeight,
        duration,
        annotations,
        classes,
        confThreshold
      );

      if (offscreenCanvas) {
        const mainCtx = canvasRef.current?.getContext("2d");
        mainCtx?.drawImage(offscreenCanvas, 0, 0);
      }
    });
  }, [annotations, confThreshold, canvasWidth]);

  // ---------- Render ----------
  return <Content width={canvasWidth} height={contentHeight} ref={canvasRef} />;
};

export default CanvasDecoration;
