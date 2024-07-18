import { startTransition, useEffect, useState } from "react";
import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useSelectRange } from "../effects.canvas";
import { drawAnnotations, drawSelectedRange } from "../functions.canvas";
import { useScaleContext } from "../contexts/scale";
import { useActionContext } from "../contexts/action";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";
import { getMaxArea } from "../functions.audio";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Interface
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
interface Props extends CanvasPropsInterface {
  maxAreaLength: number | undefined;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasDecoration = ({ canvasRef, height, maxAreaLength }: Props) => {
  const { audioBuffer, duration, annotations } = useDataContext();
  const { scale, canvasWidth } = useScaleContext();
  const { drawing, drawn } = useDrawContext();
  const { cursorPosition, selecting, selectedRange, setSelectedRange } =
    useActionContext();

  const [maxArea, setMaxArea] = useState([0, 0]);
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useEffect(() => {
    if (!audioBuffer) return;
    if (!maxAreaLength) return;
    const area = getMaxArea(audioBuffer, maxAreaLength);
    setMaxArea(area);
    if (setMaxArea) setMaxArea(area);
  }, [audioBuffer]);

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
