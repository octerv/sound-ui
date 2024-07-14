import React, { startTransition, useEffect } from "react";
import { Content } from "./styled";
import { CanvasPropsInterface, Position } from "sound-ui/types";
import { useMaxArea } from "../effects.canvas";
import { drawSelectedRanges } from "../functions.canvas";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Interface
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
interface Props extends CanvasPropsInterface {
  left: number;
  cursorPosition: Position;
  selectedRanges: number[];
  selectingRange: boolean;
  scale: number;
  drawing: boolean;
  maxArea: number[];
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasDecoration = ({
  canvasRef,
  width,
  height,
  audioBuffer,
  left,
  cursorPosition,
  selectedRanges,
  selectingRange,
  scale,
  drawing,
  maxArea,
}: Props) => {
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useEffect(() => {
    // 選択された範囲を描画する
    drawSelectedRanges(
      canvasRef,
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
        width,
        selectedRanges,
        cursorPosition,
        selectingRange,
        scale
      );
    });
  }, [drawing]);

  useMaxArea(canvasRef, audioBuffer, width, maxArea);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const wavesStyle = { left };
  return (
    <Content width={width} height={height} style={wavesStyle} ref={canvasRef} />
  );
};

export default CanvasDecoration;
