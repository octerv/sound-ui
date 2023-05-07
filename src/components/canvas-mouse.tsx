import React, { useEffect, useRef } from "react";
import { Content } from "./styled";
import { Position } from "../Waves.types";
import { useCursorEffect, useSetupMouseCanvas } from "../Waves.effects";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Interface
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  constants: { [key: string]: number };
  audioBuffer: AudioBuffer | null;
  enable: boolean;
  selectable: boolean | undefined;
  width: number;
  height: number;
  left: number;
  drew: boolean;
  scale: number;
  scaling: boolean;
  cursorPosition: Position;
  setSelectingRange: (selecting: boolean) => void;
  setCursorPosition: (position: Position) => void;
  setScale: (scale: number) => void;
  setScaling: (scaling: boolean) => void;
  setCanvasWavesLeft: (left: number) => void;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasMouse = ({
  canvasRef,
  constants,
  audioBuffer,
  enable,
  selectable,
  width,
  height,
  left,
  drew,
  scale,
  scaling,
  cursorPosition,
  setSelectingRange,
  setCursorPosition,
  setScale,
  setScaling,
  setCanvasWavesLeft,
}: Props) => {
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useSetupMouseCanvas(canvasRef);

  useCursorEffect(
    cursorPosition,
    constants,
    audioBuffer,
    canvasRef,
    drew,
    left,
    width,
    scale
  );

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Mouse Event Listener
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const scaleRef = useRef<number>();
  scaleRef.current = scale;
  const scalingRef = useRef<boolean>();
  scalingRef.current = scaling;
  const canvasWavesLeftRef = useRef<number>();
  canvasWavesLeftRef.current = left;
  const canvasWavesWidthRef = useRef<number>();
  canvasWavesWidthRef.current = width;

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
      if (e.deltaY > 4) {
        newScale = Math.floor((newScale + 0.2) * 100) / 100;
      } else if (e.deltaY < -4) {
        newScale = Math.floor((newScale - 0.2) * 100) / 100;
      }

      if (newScale >= 1.0 && newScale <= 2.0 && scaleRef.current !== newScale) {
        setScale(newScale);
        setScaling(true);
      }
    }

    // 横スクロールで位置移動
    if (e.deltaX !== 0) {
      const currentWidth = canvasWavesWidthRef.current || width;
      if (currentWidth === width) return;

      let newLeft = canvasWavesLeftRef.current || 0;
      if (e.deltaX > 2) {
        newLeft = newLeft - constants.VERTICAL_SLIDE_WIDTH;
      } else if (e.deltaX < -2) {
        newLeft = newLeft + constants.VERTICAL_SLIDE_WIDTH;
      }

      if (newLeft <= 0 && newLeft >= width - currentWidth) {
        setCanvasWavesLeft(newLeft);
      }
    }
  };

  useEffect(() => {
    if (!enable) return;
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
  }, [enable]);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Mouse Action
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!enable) return;
    if (!selectable) return;
    setSelectingRange(true);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!enable) return;
    if (!selectable) return;
    setSelectingRange(false);
  };

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const wavesStyle = { left };
  return (
    <Content
      width={width}
      height={height}
      style={wavesStyle}
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    />
  );
};

export default CanvasMouse;
