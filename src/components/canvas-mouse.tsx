import { useEffect, useRef } from "react";
import { Content } from "./styled";
import { Annotation, CanvasPropsInterface } from "sound-ui/types";
import {
  useMouseCanvasSetup,
  useCursorEffect,
  useScaling,
} from "../effects.canvas";
import { useScaleContext } from "../contexts/scale";
import { useActionContext } from "../contexts/action";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";
import { getCursorSecond } from "../functions.time";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Interface
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
interface Props extends CanvasPropsInterface {
  areaRef: React.RefObject<HTMLDivElement>;
  selectable: boolean | undefined;
  scaling: boolean;
  initNormalize: boolean | undefined;
  setScaling: (scaling: boolean) => void;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasMouse = ({
  canvasRef,
  height,
  areaRef,
  selectable,
  scaling,
  initNormalize,
  setScaling,
}: Props) => {
  const {
    audioBuffer,
    duration,
    normalize,
    setNormalize,
    annotations,
    setAnnotations,
  } = useDataContext();
  const {
    scale,
    setScale,
    contentWidth,
    canvasWidth,
    setCanvasWidth,
    canvasScrollLeft,
    setCanvasScrollLeft,
  } = useScaleContext();
  const { setDrawing, drawn } = useDrawContext();
  const {
    cursorPosition,
    setCursorPosition,
    setSelecting,
    selectedRange,
    setSelectedRange,
  } = useActionContext();

  const scaleRef = useRef<number>();
  scaleRef.current = scale;
  const scalingRef = useRef<boolean>();
  scalingRef.current = scaling;
  const canvasWavesWidthRef = useRef<number>();
  canvasWavesWidthRef.current = canvasWidth;
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useMouseCanvasSetup(canvasRef);

  useCursorEffect(cursorPosition, audioBuffer, canvasRef, drawn, canvasWidth);

  useScaling(
    scale,
    cursorPosition,
    setCursorPosition,
    contentWidth,
    setCanvasWidth,
    setCanvasScrollLeft
  );

  useEffect(() => {
    if (!drawn) return;
    setDrawing(true);
  }, [canvasWidth]);

  useEffect(() => {
    if (!drawn) return;
    if (initNormalize === undefined || initNormalize === null) return;
    if (initNormalize === normalize) return;
    console.info(`[info] initNormalize: ${initNormalize}`);
    setNormalize(initNormalize);
    setDrawing(true);
  }, [initNormalize]);

  useEffect(() => {
    if (!areaRef.current) return;
    areaRef.current.scrollLeft = canvasScrollLeft;
  }, [canvasScrollLeft]);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Mouse Event Listener
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
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
    if (scalingRef.current) return;

    // 縦スクロールで拡大縮小
    if (e.deltaY !== 0) {
      let newScale = scaleRef.current || 1.0;
      if (e.deltaY < -4) {
        newScale = Math.floor((newScale + 0.2) * 100) / 100;
      } else if (e.deltaY > 4) {
        newScale = Math.floor((newScale - 0.2) * 100) / 100;
      }

      if (newScale >= 1.0 && newScale <= 2.0 && scaleRef.current !== newScale) {
        setScale(newScale);
        setScaling(true);
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

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Mouse Action
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const onMouseDown = () => {
    if (!drawn) return;
    if (!selectable) return;
    setSelectedRange([]);
    setSelecting(true);
  };

  const onMouseUp = () => {
    if (!drawn) return;
    if (!selectable) return;
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
  };

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  return (
    <Content
      width={canvasWidth}
      height={height}
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    />
  );
};

export default CanvasMouse;
