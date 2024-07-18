import { Position } from "sound-ui/types";
import { CANVAS_PADDING, GRAPH_PADDING } from "./constants";

/**
 * 時刻を文字列として取得する
 * @param second
 * @returns
 */
function getTimeStr(second: number): string {
  const hour = Math.floor(second / (60 * 60));
  const min = Math.floor((second % (60 * 60)) / 60);
  const sec = Math.floor(second % 60);
  return hour === 0
    ? `${("0" + min).slice(-2)}:${("0" + sec).slice(-2)}`
    : `${("0" + hour).slice(-2)}:${("0" + min).slice(-2)}:${("0" + sec).slice(
        -2
      )}`;
}

/**
 * 指定時刻の現在位置を取得する
 * @param canvasWavesWidth
 * @param duration
 * @param currentTime ミリ秒
 * @returns
 */
const getTimePosition = (
  canvasWidth: number,
  duration: number,
  currentTime: number
): Position => {
  const graphWidth = canvasWidth - CANVAS_PADDING * 2 - GRAPH_PADDING * 2;
  const x =
    CANVAS_PADDING +
    GRAPH_PADDING +
    Math.floor(graphWidth * (currentTime / (duration * 1000)));
  const y = CANVAS_PADDING;
  return { x, y };
};

/**
 * カーソル位置の時刻を取得する
 * @param canvasWidth
 * @param adjustWidth 余白を指定
 * @param duration
 * @param x
 * @returns
 */
const getCursorSecond = (
  canvasWidth: number,
  adjustWidth: number,
  duration: number,
  x: number
) => {
  if (x === 0) return 0;
  return ((x - adjustWidth) * duration) / (canvasWidth - adjustWidth * 2);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export { getTimeStr, getTimePosition, getCursorSecond };
