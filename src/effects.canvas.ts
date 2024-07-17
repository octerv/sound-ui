import { RefObject, useEffect, useState } from "react";
import {
  CANVAS_PADDING,
  Color,
  GRAPH_PADDING,
  VERTICAL_SCALE_HEIGHT,
} from "./constants";
import { getCursorSecond, getTimePosition, getTimeStr } from "./functions.time";
import { clearCanvas, getCanvasContext } from "./functions.canvas";
import { sliceByNumber } from "./functions.common";
import { Position } from "sound-ui/types";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// effect functions
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const useFrameCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement> | null
) => {
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    const { canvasCtx, canvasWidth, canvasHeight } =
      getCanvasContext(canvasRef);
    canvasCtx.globalAlpha = 0.8;
    canvasCtx.lineWidth = 0.5;
    // 外枠の描画
    canvasCtx.fillStyle = Color.DeepSeaBlue;
    canvasCtx.beginPath();
    canvasCtx.rect(0, 0, canvasWidth, canvasHeight);
    canvasCtx.closePath();
    canvasCtx.stroke();
  }, [canvasRef]);
};

const useWavesCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement> | null
) => {
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    const { canvasCtx } = getCanvasContext(canvasRef);
    canvasCtx.globalAlpha = 0.8;
    canvasCtx.lineWidth = 0.5;
  }, [canvasRef]);
};

const useMouseCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement> | null
) => {
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    const { canvasCtx } = getCanvasContext(canvasRef);
    canvasCtx.globalAlpha = 0.8;
    canvasCtx.lineWidth = 0.5;
  }, [canvasRef]);
};

const useCoverCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  audioBuffer: AudioBuffer | null,
  stereo: boolean | undefined
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    const { canvasCtx, canvasWidth, canvasHeight } =
      getCanvasContext(canvasRef);
    canvasCtx.fillStyle = Color.PureWhite;
    canvasCtx.beginPath();
    canvasCtx.rect(1, 1, CANVAS_PADDING - 2, canvasHeight - 2);
    canvasCtx.rect(
      canvasWidth - (CANVAS_PADDING - 1),
      1,
      CANVAS_PADDING - 2,
      canvasHeight - 2
    );
    canvasCtx.closePath();
    canvasCtx.fill();

    if (stereo) return;

    const graphHeight =
      (canvasHeight - CANVAS_PADDING * 3 - VERTICAL_SCALE_HEIGHT) / 2;
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      // channel text
      canvasCtx.fillStyle = Color.DeepSlate;
      canvasCtx.font = "12px serif";
      canvasCtx.fillText(
        `channel ${i + 1}`,
        CANVAS_PADDING + 16,
        graphHeight * i + CANVAS_PADDING * (i + 1) + 16
      );
    }
  }, [audioBuffer]);
};

const useFrameCanvasUpdate = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  audioBuffer: AudioBuffer | null
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;

    const { canvasCtx, canvasWidth, canvasHeight } =
      getCanvasContext(canvasRef);
    const graphWidth = canvasWidth - CANVAS_PADDING * 2;
    const graphHeight =
      (canvasHeight - CANVAS_PADDING * 3 - VERTICAL_SCALE_HEIGHT) / 2;
    console.debug(
      `canvas: ${canvasWidth}x${canvasHeight}, graph: ${graphWidth}x${graphHeight}`
    );

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const centerHeight =
        CANVAS_PADDING * (i * 1) + graphHeight * i + graphHeight / 2;

      // draw frame
      canvasCtx.strokeStyle = Color.DeepTeal;
      canvasCtx.lineWidth = 1;
      canvasCtx.beginPath();
      canvasCtx.rect(
        CANVAS_PADDING,
        graphHeight * i + CANVAS_PADDING * (i + 1),
        graphWidth,
        graphHeight
      );
      canvasCtx.closePath();
      canvasCtx.stroke();

      // draw grid (horizontal)
      canvasCtx.strokeStyle = Color.DeepSlate;
      canvasCtx.lineWidth = 0.2;
      canvasCtx.beginPath();
      canvasCtx.moveTo(CANVAS_PADDING, centerHeight);
      canvasCtx.lineTo(CANVAS_PADDING + graphWidth, centerHeight);
      canvasCtx.closePath();
      canvasCtx.stroke();
    }
  }, [audioBuffer]);
};

const useFrameCanvasStereoUpdate = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  audioBuffer: AudioBuffer | null
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;

    const { canvasCtx, canvasWidth, canvasHeight } =
      getCanvasContext(canvasRef);
    const graphWidth = canvasWidth - CANVAS_PADDING * 2;
    const graphHeight =
      canvasHeight - CANVAS_PADDING * 2 - VERTICAL_SCALE_HEIGHT;
    console.debug(
      `canvas: ${canvasWidth}x${canvasHeight}, graph: ${graphWidth}x${graphHeight}`
    );

    const centerHeight = CANVAS_PADDING + graphHeight / 2;

    // draw frame
    canvasCtx.strokeStyle = Color.DeepTeal;
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();
    canvasCtx.rect(CANVAS_PADDING, CANVAS_PADDING, graphWidth, graphHeight);
    canvasCtx.closePath();
    canvasCtx.stroke();

    // draw grid (horizontal)
    canvasCtx.strokeStyle = Color.DeepTeal;
    canvasCtx.lineWidth = 0.2;
    canvasCtx.beginPath();
    canvasCtx.moveTo(CANVAS_PADDING, centerHeight);
    canvasCtx.lineTo(CANVAS_PADDING + graphWidth, centerHeight);
    canvasCtx.closePath();
    canvasCtx.stroke();
  }, [audioBuffer]);
};

/**
 * Canvasの描画をクリアする
 * @param dataUrl
 * @param canvasFrameRef
 * @param canvasWavesRef
 * @param canvasDecorationRef
 */
const useCanvasClear = (
  dataUrl: string,
  canvasFrameRef: RefObject<HTMLCanvasElement> | null,
  canvasWavesRef: RefObject<HTMLCanvasElement> | null,
  canvasDecorationRef: RefObject<HTMLCanvasElement> | null
) => {
  useEffect(() => {
    if (!dataUrl) return; // dataUrlが提供されていなければ終了

    // clear canvas
    if (!canvasFrameRef || !canvasFrameRef.current) return;
    clearCanvas(canvasFrameRef);
    clearCanvas(canvasWavesRef);
    clearCanvas(canvasDecorationRef);
  }, [dataUrl]);
};

const useScaling = (
  scale: number,
  position: Position,
  setCursorPosition: (position: Position) => void,
  initWidth: number,
  setCanvasWidth: (width: number) => void,
  setCanvasScrollLeft: (left: number) => void
) => {
  useEffect(() => {
    // Canvasの幅の拡大縮小
    const updateWidth = Math.floor(initWidth * scale);
    setCanvasWidth(updateWidth);

    // カーソル位置の調整
    setCursorPosition({ x: position.x * scale, y: position.y });

    // スクロール位置の調整
    const scaledX = position.x * scale;
    const adjust = scaledX - position.x;
    setCanvasScrollLeft(adjust);
  }, [scale]);
};

/**
 * マウスの動きによる副作用
 * @param position
 * @param audioBuffer
 * @param canvasRef
 * @param drawn
 * @param canvasWidth
 */
const useCursorEffect = (
  position: { [key: string]: number },
  audioBuffer: AudioBuffer | null,
  canvasRef: RefObject<HTMLCanvasElement> | null,
  drawn: boolean,
  canvasWidth: number
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!drawn) return;
    if (!canvasRef || !canvasRef.current) return;

    const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);

    // clear
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    // グラフの範囲外に出たら消したままにする
    if (
      position.x < CANVAS_PADDING + GRAPH_PADDING ||
      position.x > canvasWidth - (CANVAS_PADDING + GRAPH_PADDING) ||
      position.y < CANVAS_PADDING ||
      position.y > canvasHeight - VERTICAL_SCALE_HEIGHT
    )
      return;

    // draw
    canvasCtx.strokeStyle = Color.DeepSlate;
    canvasCtx.fillStyle = Color.DeepSlate;
    canvasCtx.globalAlpha = 0.8;
    canvasCtx.beginPath();
    canvasCtx.moveTo(position.x, CANVAS_PADDING);
    canvasCtx.lineTo(
      position.x,
      canvasHeight - CANVAS_PADDING - VERTICAL_SCALE_HEIGHT
    );
    canvasCtx.closePath();
    canvasCtx.stroke();

    // カーソル位置のTime表示
    const sec = getCursorSecond(
      canvasWidth,
      CANVAS_PADDING + GRAPH_PADDING,
      audioBuffer.duration,
      position.x
    );
    canvasCtx.fillText(
      getTimeStr(sec),
      position.x + 8,
      canvasHeight - VERTICAL_SCALE_HEIGHT - 16
    );
  }, [position, canvasWidth]);
};

/**
 * マウスで範囲選択された箇所を配列にする
 * @param selecting
 * @param position
 * @param scale
 * @param canvasWavesLeft
 * @param drewWaves
 * @param canvasRef
 * @returns
 */
const useSelectRange = (
  selecting: boolean,
  position: { [key: string]: number },
  scale: number,
  canvasWavesLeft: number,
  drewWaves: boolean,
  canvasRef: RefObject<HTMLCanvasElement> | null,
  selectedRange: number[],
  setSelectedRange: (selectedRange: number[]) => void
) => {
  useEffect(() => {
    if (!drewWaves) return;
    if (!canvasRef || !canvasRef.current) return;
    if (!selecting) return;
    // グラフの範囲外に出たら消したままにする
    const { canvasWidth, canvasHeight } = getCanvasContext(canvasRef);
    const frameWidth = canvasWidth / scale;
    const unscaledPosX = Math.round(position.x / scale);

    const outOfCanvas =
      position.x < CANVAS_PADDING + GRAPH_PADDING - canvasWavesLeft ||
      position.x >
        frameWidth - (CANVAS_PADDING + GRAPH_PADDING) - canvasWavesLeft ||
      position.y < CANVAS_PADDING ||
      position.y > canvasHeight - VERTICAL_SCALE_HEIGHT;

    const cloneRange = JSON.parse(JSON.stringify(selectedRange));
    const rescaleRange = sliceByNumber(cloneRange, 2);
    let isInRanges = false;
    for (const check of rescaleRange) {
      if (check.length === 2) {
        if (check[0] <= position.x && position.x <= check[1]) {
          isInRanges = true;
        }
      }
    }

    // 選択開始
    if (outOfCanvas) return;
    if (isInRanges) return;
    if (cloneRange.length === 0 || cloneRange.length === 1) {
      // 開始位置もしくは終了位置を追加する
      cloneRange.push(unscaledPosX);
    } else {
      // 終了位置を入れ替える
      cloneRange.pop();
      cloneRange.push(unscaledPosX);
    }

    setSelectedRange(cloneRange);
  }, [position, selecting]);
};

/**
 * 指定された現在時刻のバーを描画する
 * @param canvasRef
 * @param audioBuffer
 * @param canvasWavesWidth
 * @param currentTime
 */
const useCurrentTime = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  audioBuffer: AudioBuffer | null,
  canvasWavesWidth: number,
  currentTime: number | undefined
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    if (!currentTime) return;
    clearCanvas(canvasRef);

    const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);
    const graphHeight =
      canvasHeight - CANVAS_PADDING * 2 - VERTICAL_SCALE_HEIGHT;
    const { x, y } = getTimePosition(
      canvasWavesWidth,
      audioBuffer.duration,
      currentTime
    );

    // draw
    canvasCtx.strokeStyle = "red";
    canvasCtx.lineWidth = 1.0;
    canvasCtx.beginPath();
    canvasCtx.moveTo(x, y);
    canvasCtx.lineTo(x, y + graphHeight);
    canvasCtx.closePath();
    canvasCtx.stroke();
  }, [currentTime]);
};

const useMaxArea = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  audioBuffer: AudioBuffer | null,
  canvasWavesWidth: number,
  maxArea: number[]
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    if (maxArea[1] === 0) return;

    const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);
    const graphHeight =
      canvasHeight - CANVAS_PADDING * 2 - VERTICAL_SCALE_HEIGHT;

    const { x: x1, y: y1 } = getTimePosition(
      canvasWavesWidth,
      audioBuffer?.duration,
      maxArea[0] * 1000
    );
    const { x: x2 } = getTimePosition(
      canvasWavesWidth,
      audioBuffer?.duration,
      maxArea[1] * 1000
    );
    console.debug(`area x1:${x1},y1:${y1},x2:${x2},y2:${graphHeight}`);

    canvasCtx.fillStyle = "rgba(255,0,0, 0.3)";
    canvasCtx.beginPath();
    canvasCtx.rect(1, 1, CANVAS_PADDING - 2, canvasHeight - 2);
    canvasCtx.rect(x1, y1, x2, graphHeight);
    canvasCtx.closePath();
    canvasCtx.fill();
  }, [maxArea]);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export {
  useFrameCanvasSetup,
  useWavesCanvasSetup,
  useMouseCanvasSetup,
  useCoverCanvasSetup,
  useFrameCanvasUpdate,
  useFrameCanvasStereoUpdate,
  useCanvasClear,
  useScaling,
  useCursorEffect,
  useSelectRange,
  useCurrentTime,
  useMaxArea,
};
