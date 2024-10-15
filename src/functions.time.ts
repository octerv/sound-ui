import { Position, TimeScale } from "sound-ui/types";
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
 * 指定時刻のキャンバス上の現在位置を取得する
 * @param canvasWidth
 * @param duration
 * @param currentTime ミリ秒
 * @returns
 */
const getTimePosition = (
  canvasWidth: number,
  duration: number,
  currentTime: number
): Position => {
  const x = (currentTime / duration) * canvasWidth;
  const y = 0;
  return { x, y };
};

/**
 * カーソル位置の時刻を取得する
 * @param canvasWidth
 * @param duration
 * @param x
 * @param scrollLeft
 * @returns
 */
const getCursorSecond = (
  canvasWidth: number,
  graphWidth: number,
  scale: number,
  duration: number,
  x: number,
  scrollLeft: number
) => {
  // if (x === 0) return 0;
  const graphX = x - CANVAS_PADDING;
  // 計算基準にする幅（描画領域に貼り付ける
  const canvasX =
    scale === 1.0 ? (graphX / graphWidth) * canvasWidth : graphX + scrollLeft;

  // 時刻に変換して返却
  return (canvasX / canvasWidth) * duration;
};

// SPLIT SCALE
// duration >= 1:00:00 ... each 10:00 = sampleRate * 600
// duration >= 30:00 && duration < 1:00:00 ... each 5:00 = sampleRate * 300
// duration >= 10:00 && duration < 30:00 ... each 3:00 = sampleRate * 180
// duration >= 1:00 && duration < 10:00 ... each 1:00 = sampleRate * 60
// duration < 1:00 ... each 0:05 = sampleRate * 5
const getTimeScales = (audioBuffer: AudioBuffer, canvasWidth: number) => {
  const duration = audioBuffer.duration;
  const timeScales: TimeScale[] = [];
  for (let t = 0; t <= duration; t = t + 60) {
    const x = (t / duration) * canvasWidth;
    timeScales.push({
      x,
      t,
    });
  }
  return timeScales;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export { getTimeStr, getTimePosition, getCursorSecond, getTimeScales };
