import { useEffect, useRef } from "react";
import { Content } from "./styled";
import { Annotation } from "sound-ui/types";
import { useMouseCanvasSetup, useCursorEffect } from "../effects.canvas";
import { useScaleContext } from "../contexts/scale";
import { useActionContext } from "../contexts/action";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";
import { getCursorSecond } from "../functions.time";
import { MAGNIFICATION, MAX_SCALE } from "../constants";

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
  const { contentHeight, scale, setScale, canvasWidth } = useScaleContext();
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
  const scaleRef = useRef<number>();
  scaleRef.current = scale;

  // ---------- Effects ----------
  useMouseCanvasSetup(canvasRef);

  useCursorEffect(cursorPosition, audioBuffer, canvasRef, drawn, canvasWidth);

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
      let newScale = scaleRef.current || 1.0;
      if (e.deltaY < -4) {
        newScale = Math.floor((newScale + MAGNIFICATION) * 10) / 10;
      } else if (e.deltaY > 4) {
        newScale = Math.floor((newScale - MAGNIFICATION) * 10) / 10;
      }

      if (
        newScale >= 1.0 &&
        newScale <= MAX_SCALE &&
        scaleRef.current !== newScale
      ) {
        setScale(newScale);
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
        duration,
        cursorPosition.x
      );
      setClickedTime(newClickedTime);
    }

    if (selectable) {
      const prevAnnotations = JSON.parse(JSON.stringify(annotations));
      const x0 = getCursorSecond(canvasWidth, duration, selectedRange[0]);
      const x1 = getCursorSecond(canvasWidth, duration, selectedRange[1]);
      const newAnnotation: Annotation = {
        startTime: x0,
        endTime: x1,
        label: "",
      };
      setAnnotations([...prevAnnotations, newAnnotation]);
      setSelecting(false);
    }
  };

  // ---------- Render ----------
  return (
    <Content
      width={canvasWidth}
      height={contentHeight}
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    />
  );
};

export default CanvasMouse;
