import React, { startTransition, useEffect } from "react";
import { Content } from "./styled";
import { Position } from "../Waves.types";
import { drawSelectedRanges } from "../Waves.functions";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Interface
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  constants: { [key: string]: number };
  width: number;
  height: number;
  left: number;
  cursorPosition: Position;
  selectedRanges: number[];
  selectingRange: boolean;
  scale: number;
  drawing: boolean;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasDecoration = ({
  canvasRef,
  constants,
  width,
  height,
  left,
  cursorPosition,
  selectedRanges,
  selectingRange,
  scale,
  drawing,
}: Props) => {
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useEffect(() => {
    // 選択された範囲を描画する
    drawSelectedRanges(
      canvasRef,
      constants,
      width,
      selectedRanges,
      cursorPosition,
      selectingRange,
      scale
    );
  }, [cursorPosition]);

  useEffect(() => {
    if (!drawing) return;
    if (!canvasRef || !canvasRef.current) return;
    // draw waves
    startTransition(() => {
      drawSelectedRanges(
        canvasRef,
        constants,
        width,
        selectedRanges,
        cursorPosition,
        selectingRange,
        scale
      );
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

export default CanvasDecoration;
