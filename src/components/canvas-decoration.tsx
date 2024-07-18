import { startTransition, useEffect } from "react";
import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useSelectRange } from "../effects.canvas";
import { drawAnnotations, drawSelectedRange } from "../functions.canvas";
import { useScaleContext } from "../contexts/scale";
import { useActionContext } from "../contexts/action";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasDecoration = ({ canvasRef, height }: CanvasPropsInterface) => {
  const { duration, annotations } = useDataContext();
  const { scale, canvasWidth } = useScaleContext();
  const { drawn } = useDrawContext();
  const { cursorPosition, selecting, selectedRange, setSelectedRange } =
    useActionContext();

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
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
      canvasWidth,
      selectedRange,
      cursorPosition,
      selecting,
      scale
    );
  }, [cursorPosition, selecting]);

  useEffect(() => {
    console.log(annotations);
    if (annotations.length === 0) return;
    // 選択された範囲を描画する
    startTransition(() => {
      drawAnnotations(canvasRef, canvasWidth, duration, annotations);
    });
  }, [annotations, canvasWidth]);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasDecoration;
