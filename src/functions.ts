import { RefObject } from "react";

/**
 * Canvasのコンテキストを取得する
 * @param ref
 * @returns
 */
const getCanvasContext = (
  ref: RefObject<HTMLCanvasElement>
): {
  canvasCtx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
} => {
  const canvasEle: HTMLCanvasElement = ref.current!;
  const canvasWidth = canvasEle.clientWidth;
  const canvasHeight = canvasEle.clientHeight;
  const canvasCtx: CanvasRenderingContext2D = canvasEle.getContext("2d")!;
  return { canvasCtx, canvasWidth, canvasHeight };
};

export { getCanvasContext };
