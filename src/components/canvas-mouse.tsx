import { useEffect, useRef } from "react";
import { Content } from "./styled";
import { Annotation } from "sound-ui/types";
import { useMouseCanvasSetup, useCursorEffect } from "../effects.canvas";
import { useScaleContext } from "../contexts/scale";
import { useActionContext } from "../contexts/action";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";
import { getCursorSecond } from "../functions.time";
import {
  CANVAS_PADDING,
  MAGNIFICATION,
  MAX_ZOOM_LEVEL,
  VERTICAL_SCALE_HEIGHT,
} from "../constants";

const CanvasMouse = () => {
  const {
    audioBuffer,
    duration,
    clickable,
    setClickedTime,
    annotations,
    setAnnotations,
    selectable,
  } = useDataContext();
  const {
    contentWidth,
    contentHeight,
    zoomLevel,
    setZoomLevel,
    canvasWidth,
    scrollLeft,
  } = useScaleContext();
  const graphWidth = contentWidth - CANVAS_PADDING * 2;
  const graphHeight = contentHeight - CANVAS_PADDING - VERTICAL_SCALE_HEIGHT;
  const { drawn } = useDrawContext();
  const {
    cursorPosition,
    setCursorPosition,
    setSelecting,
    selectedRange,
    setSelectedRange,
  } = useActionContext();

  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomLevelRef = useRef<number>();
  zoomLevelRef.current = zoomLevel;

  // ---------- Effects ----------
  useMouseCanvasSetup(canvasRef);

  // カーソル位置の縦棒などを描画
  useCursorEffect(
    cursorPosition,
    audioBuffer,
    canvasRef,
    drawn,
    contentWidth,
    contentHeight,
    canvasWidth,
    graphWidth,
    graphHeight,
    zoomLevel,
    scrollLeft
  );

  // ---------- Mouse event listener ----------
  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canvasRef || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const posX = e.clientX - rect.left;
    const posY = e.clientY - rect.top;

    // scale center
    setCursorPosition({ x: posX, y: posY });
  };

  const onMouseWheel = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 縦スクロールで拡大縮小
    if (e.deltaY !== 0) {
      let newZoomLevel = zoomLevelRef.current || 1.0;
      if (e.deltaY < -4) {
        newZoomLevel = Math.floor((newZoomLevel + MAGNIFICATION) * 10) / 10;
      } else if (e.deltaY > 4) {
        newZoomLevel = Math.floor((newZoomLevel - MAGNIFICATION) * 10) / 10;
      }

      if (
        newZoomLevel >= 1.0 &&
        newZoomLevel <= MAX_ZOOM_LEVEL &&
        zoomLevelRef.current !== newZoomLevel
      ) {
        setZoomLevel(newZoomLevel);
      }
    }
  };

  useEffect(() => {
    if (!drawn) return;
    if (!canvasRef || !canvasRef.current) return;

    // マウスイベント登録
    canvasRef.current.addEventListener("mousemove", onMouseMove);
    canvasRef.current.addEventListener("wheel", onMouseWheel, {
      passive: false,
    });

    // マウスイベント解除
    return () => {
      canvasRef.current?.removeEventListener("mousemove", onMouseMove);
      canvasRef.current?.removeEventListener("wheel", onMouseWheel);
    };
  }, [drawn]);

  // ---------- Mouse action ----------
  const onMouseDown = () => {
    if (!drawn) return;
    if (!selectable) return;
    setSelectedRange([]);
    setSelecting(true);
  };

  const onMouseUp = () => {
    if (!drawn) return;

    if (clickable) {
      const newClickedTime = getCursorSecond(
        canvasWidth,
        graphWidth,
        zoomLevel,
        duration,
        cursorPosition.x,
        scrollLeft
      );
      setClickedTime(newClickedTime);
    }

    if (selectable) {
      const prevAnnotations = JSON.parse(JSON.stringify(annotations));
      const x0 = getCursorSecond(
        canvasWidth,
        graphWidth,
        zoomLevel,
        duration,
        selectedRange[0],
        scrollLeft
      );
      const x1 = getCursorSecond(
        canvasWidth,
        graphWidth,
        zoomLevel,
        duration,
        selectedRange[1],
        scrollLeft
      );
      const newAnnotation: Annotation = {
        startTime: x0,
        endTime: x1,
        label: "",
        confidence: 0.0,
      };
      setAnnotations([...prevAnnotations, newAnnotation]);
      setSelecting(false);
    }
  };

  // ---------- Render ----------
  return (
    <Content
      width={contentWidth}
      height={contentHeight}
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    />
  );
};

export default CanvasMouse;
