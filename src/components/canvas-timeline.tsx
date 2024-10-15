import { Content } from "./styled";
import { useScaleContext } from "../contexts/scale";
import { useDataContext } from "../contexts/data";
import { useEffect, useRef } from "react";
import { clearCanvas, drawLine, getCanvasContext } from "../functions.canvas";
import { CANVAS_PADDING, Color, VERTICAL_SCALE_HEIGHT } from "../constants";

const CanvasTimeline = () => {
  const { currentTime, currentTimeX } = useDataContext();
  const { contentWidth, contentHeight } = useScaleContext();
  const graphHeight = contentHeight - CANVAS_PADDING - VERTICAL_SCALE_HEIGHT;

  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---------- Effects ----------
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    const { canvasCtx } = getCanvasContext(canvasRef);
    clearCanvas(canvasRef);

    if (currentTime === 0 || currentTimeX < 0) return;
    // 再生位置を表すバーを描画
    drawLine(
      canvasCtx,
      currentTimeX,
      CANVAS_PADDING,
      0,
      graphHeight,
      Color.BrightRed
    );
  }, [currentTimeX]);

  // ---------- Render ----------
  return (
    <Content width={contentWidth} height={contentHeight} ref={canvasRef} />
  );
};

export default CanvasTimeline;
