import { RefObject, useEffect } from "react";
import {
  CANVAS_PADDING,
  Color,
  Font,
  GRAPH_PADDING,
  VERTICAL_SCALE_HEIGHT,
} from "./constants";
import { getCursorSecond, getTimePosition, getTimeStr } from "./functions.time";
import {
  clearCanvas,
  drawLine,
  drawRect,
  drawText,
  getCanvasContext,
} from "./functions.canvas";
import { sliceByNumber } from "./functions.common";
import { Position } from "sound-ui/types";

/**
 * 指定されたキャンバスにグラフを設定するためのフックです。
 * キャンバスは複数のチャネルで区切られたグラフを描画するために使用されます。
 * グラフのサイズと位置は、入力パラメータに基づいて動的に計算されます。
 *
 * @param {RefObject<HTMLCanvasElement> | null} canvasRef - グラフを描画するキャンバスへの参照。
 * @param {number} contentHeight - キャンバス内のコンテンツの総高さ。
 * @param {number} canvasWidth - キャンバスの幅。
 * @param {number} numberOfChannels - グラフに表示するチャネルの数。
 *
 * キャンバスやチャネルが設定されていない、またはチャネル数が0の場合は何もしません。
 * キャンバスは初期化され、指定されたチャネル数に基づいて各チャネルのグラフが描画されます。
 * 各チャネルのグラフは縦に並べられ、適切なパディングが適用されます。
 */
const useFrameCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  contentHeight: number,
  canvasWidth: number,
  numberOfChannels: number
) => {
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    if (numberOfChannels === 0) return;
    clearCanvas(canvasRef);

    // グラフのサイズを設定
    const { canvasCtx } = getCanvasContext(canvasRef);
    const graphWidth = canvasWidth - CANVAS_PADDING * 2;
    const graphHeight =
      (contentHeight - VERTICAL_SCALE_HEIGHT) / numberOfChannels -
      CANVAS_PADDING * 2;
    console.debug(
      `canvasWidth: ${canvasWidth}, contentHeight: ${contentHeight}, graph: ${graphWidth}x${graphHeight}`
    );

    for (let i = 0; i < numberOfChannels; i++) {
      const numOfPadding = 2 * i + 1;
      drawRect(
        canvasCtx,
        CANVAS_PADDING,
        graphHeight * i + CANVAS_PADDING * numOfPadding,
        graphWidth,
        graphHeight,
        Color.DeepSeaBlue
      );
    }
  }, [canvasRef, canvasWidth, numberOfChannels]);
};

/**
 * 指定されたキャンバスへの参照を使用して、波形を描画するための初期設定を行うフックです。
 * キャンバスが存在しない、または初期化されていない場合は、何もしません。
 * 設定されるキャンバスのコンテキストは透明度と線の太さが調整され、後に波形の描画が行われます。
 *
 * @param {RefObject<HTMLCanvasElement> | null} canvasRef - 波形を描画するキャンバスへの参照。
 *
 * TODO: 波形の中央に横線を引く実装が必要。
 */
const useWavesCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement> | null
) => {
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    const { canvasCtx } = getCanvasContext(canvasRef);
    canvasCtx.globalAlpha = 0.8;
    canvasCtx.lineWidth = 0.5;
    // TODO: 波形の中央に横線を引きたい
  }, [canvasRef]);
};

/**
 * 指定されたキャンバスへの参照を利用して、マウスイベントに対応する描画設定を初期化するフックです。
 * キャンバスが存在しない、または初期化されていない場合は、何も行われません。
 * 初期設定として、透明度と線の太さを指定していますが、具体的なマウスイベントに関する処理は
 * 追加されていません。
 *
 * @param {RefObject<HTMLCanvasElement> | null} canvasRef - 描画設定を適用するキャンバスへの参照。
 *
 * このフックを使用する場合は、実際のマウスイベントハンドラーをフック外で設定する必要があります。
 */
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

/**
 * 指定されたキャンバスへの参照を使用して、チャンネルごとのラベル付きカバーセットアップを初期化するフックです。
 * チャンネル数が0の場合、またはキャンバスが存在しない場合は、処理を行いません。
 * キャンバスはクリアされ、指定されたチャンネル数に基づき、各チャンネルにラベルを描画します。
 * ラベルはチャンネル毎に適切な位置に配置されます。
 *
 * @param {RefObject<HTMLCanvasElement> | null} canvasRef - 描画を行うキャンバスへの参照。
 * @param {number} numberOfChannels - 描画するチャンネルの数。
 *
 * 各チャンネルの高さは、キャンバスの総高さから一定のパディングと垂直スケールの高さを差し引いたものを
 * チャンネル数で割ることにより計算されます。チャンネルのラベルは、その高さに基づいて適切な位置に配置されます。
 */
const useCoverCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  numberOfChannels: number
) => {
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    if (numberOfChannels === 0) return;
    clearCanvas(canvasRef);
    if (numberOfChannels === 1) return;
    const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);

    const graphHeight =
      (canvasHeight - CANVAS_PADDING * 3 - VERTICAL_SCALE_HEIGHT) /
      numberOfChannels;

    for (let i = 0; i < numberOfChannels; i++) {
      const numOfPadding = 2 * i + 1;
      // channel text
      drawText(
        canvasCtx,
        CANVAS_PADDING + 16,
        graphHeight * i + CANVAS_PADDING * numOfPadding + 16,
        `channel ${i + 1}`,
        Font.Default,
        Color.DeepSlate
      );
    }
  }, [numberOfChannels]);
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

/**
 * スケール値に基づいてキャンバスの幅を調整し、カーソルとスクロール位置を適切に設定するフックです。
 * 指定されたスケール倍率を使用して初期キャンバス幅を調整し、新しい幅を設定します。
 * また、カーソル位置もスケールに応じて調整され、スクロール位置がカーソル位置に追従するように設定されます。
 *
 * @param {number} scale - 適用するスケール倍率。
 * @param {Position} position - 現在のカーソル位置。
 * @param {(position: Position) => void} setCursorPosition - カーソル位置を設定する関数。
 * @param {number} initWidth - スケール適用前の初期キャンバス幅。
 * @param {(width: number) => void} setCanvasWidth - キャンバスの幅を設定する関数。
 * @param {(left: number) => void} setCanvasScrollLeft - キャンバスのスクロール位置を設定する関数。
 *
 * このフックは、スケール値が変更されるたびにキャンバスの幅、カーソル位置、およびスクロール位置を更新します。
 * スケール倍率の適用によってカーソル位置が変更された場合、それに応じてスクロール位置も調整され、
 * キャンバス上でのカーソルの相対位置が維持されるようにします。
 */
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
    const sec = getCursorSecond(canvasWidth, audioBuffer.duration, position.x);
    drawText(
      canvasCtx,
      position.x + 8,
      canvasHeight - VERTICAL_SCALE_HEIGHT - 16,
      getTimeStr(sec),
      Font.Default,
      Color.DeepSlate
    );
  }, [position, canvasWidth]);
};

/**
 * マウスで範囲選択された箇所を配列にする
 * @param selecting
 * @param position
 * @param scale
 * @param drewWaves
 * @param canvasRef
 * @returns
 */
const useSelectRange = (
  selecting: boolean,
  position: { [key: string]: number },
  scale: number,
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
      position.x < CANVAS_PADDING + GRAPH_PADDING ||
      position.x > frameWidth - (CANVAS_PADDING + GRAPH_PADDING) ||
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
 * @param duration
 * @param canvasWidth
 * @param currentTime
 */
const useCurrentTime = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  duration: number,
  canvasWidth: number,
  currentTime: number | undefined
) => {
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    if (duration === 0) return;
    if (!currentTime) return;
    clearCanvas(canvasRef);

    const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);
    const graphHeight =
      canvasHeight - CANVAS_PADDING * 2 - VERTICAL_SCALE_HEIGHT;
    const { x, y } = getTimePosition(canvasWidth, duration, currentTime);

    drawLine(canvasCtx, x, y, 0, graphHeight, Color.BrightRed);
  }, [currentTime]);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export {
  useFrameCanvasSetup,
  useWavesCanvasSetup,
  useMouseCanvasSetup,
  useCoverCanvasSetup,
  useCanvasClear,
  useScaling,
  useCursorEffect,
  useSelectRange,
  useCurrentTime,
};
