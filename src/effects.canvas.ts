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

/**
 * 指定されたキャンバスにグラフを設定するためのフックです。
 * キャンバスは複数のチャネルで区切られたグラフを描画するために使用されます。
 * グラフのサイズと位置は、入力パラメータに基づいて動的に計算されます。
 *
 * @param {RefObject<HTMLCanvasElement> | null} canvasRef - グラフを描画するキャンバスへの参照。
 * @param {number} contentHeight - キャンバス内のコンテンツの総幅。
 * @param {number} contentHeight - キャンバス内のコンテンツの総高さ。
 * @param {AudioBuffer} audioBuffer - 読み込まれたオーディオデータ
 * @param {number} numberOfChannels - グラフに表示するチャネルの数。
 *
 * キャンバスやチャネルが設定されていない、またはチャネル数が0の場合は何もしません。
 * キャンバスは初期化され、指定されたチャネル数に基づいて各チャネルのグラフが描画されます。
 * 各チャネルのグラフは縦に並べられ、適切なパディングが適用されます。
 */
const useFrameCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  contentWidth: number,
  contentHeight: number,
  audioBuffer: AudioBuffer | null,
  numberOfChannels: number
) => {
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    if (!audioBuffer) return;
    if (numberOfChannels === 0) return;
    clearCanvas(canvasRef);

    // グラフのサイズを設定
    const { canvasCtx } = getCanvasContext(canvasRef);
    const graphWidth = contentWidth - CANVAS_PADDING * 2;
    const graphHeight = contentHeight - CANVAS_PADDING - VERTICAL_SCALE_HEIGHT;

    // 外枠の描画
    drawRect(
      canvasCtx,
      CANVAS_PADDING,
      CANVAS_PADDING,
      graphWidth,
      graphHeight,
      Color.DeepSeaBlue
    );

    // チャンネルを分割する線を描画
    for (let i = 1; i < numberOfChannels; i++) {
      const separateHeight = (graphHeight / numberOfChannels) * i;
      drawLine(
        canvasCtx,
        CANVAS_PADDING,
        separateHeight,
        graphWidth,
        0,
        Color.DeepSeaBlue
      );
    }
  }, [audioBuffer, numberOfChannels]);
};

/**
 * 指定されたキャンバスに対して波形表示の準備を行うカスタムフックです。
 * このフックは、キャンバスの参照と波形データを示すデータURLを受け取り、キャンバスが存在する場合にそのキャンバスをクリアします。
 * これにより、新たな波形データが描画される前に前の描画を消去することができます。
 *
 * @param {RefObject<HTMLCanvasElement> | null} canvasRef - 操作するキャンバスへの参照。
 * @param {string} dataUrl - 波形データのURL。このURLが変更されるたびにキャンバスのクリアがトリガーされます。
 *
 * useEffectフックを利用して、キャンバスの参照が有効かつ実際にDOMに存在することを確認した上で、
 * clearCanvas関数を呼び出してキャンバスをクリアします。これはdataUrlが更新されるたび、
 * またはコンポーネントが新たにマウントされたときにも実行されます。
 * このフックは主にオーディオビジュアライゼーションやその他のキャンバスベースの描画で利用され、
 * 常にクリアなキャンバスから描画を始められるようにします。
 */
const useWavesCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  dataUrl: string | undefined
) => {
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    clearCanvas(canvasRef);
  }, [canvasRef, dataUrl]);
};

/**
 * 指定されたキャンバスに対して装飾的な初期設定を適用するカスタムフックです。
 * このフックは、キャンバスの参照とデータURLを受け取り、キャンバスが存在する場合にそのキャンバスをクリアします。
 * 主にキャンバスに新しい画像やデコレーションを描画する前の準備として使用されます。
 *
 * @param {RefObject<HTMLCanvasElement> | null} canvasRef - クリアするキャンバスへの参照。
 * @param {string} dataUrl - キャンバスに描画するための画像データのURL。このURLは直接使用されませんが、
 *                           依存配列に含まれているため、URLが変更されるとキャンバスが再度クリアされます。
 *
 * useEffectフックを使用して、canvasRefが指すキャンバスの存在を確認し、存在する場合には
 * clearCanvas関数を呼び出してキャンバスをクリアします。これにより、キャンバスが新しい描画で使用される際に、
 * 古い内容がクリアされていることを保証します。dataUrlが変更された場合にもキャンバスをクリアすることで、
 * 常に最新の状態で使用開始できるようにしています。
 */
const useDecorationCanvasSetup = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  dataUrl: string | undefined
) => {
  useEffect(() => {
    if (!canvasRef || !canvasRef.current) return;
    clearCanvas(canvasRef);
  }, [canvasRef, dataUrl]);
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
 * マウスの動きによる副作用
 * @param position
 * @param audioBuffer
 * @param canvasRef
 * @param drawn
 * @param canvasWidth
 * @param scrollLeft
 */
const useCursorEffect = (
  position: { [key: string]: number },
  audioBuffer: AudioBuffer | null,
  canvasRef: RefObject<HTMLCanvasElement> | null,
  drawn: boolean,
  contentWidth: number,
  contentHeight: number,
  canvasWidth: number,
  graphWidth: number,
  graphHeight: number,
  zoomLevel: number,
  scrollLeft: number
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!drawn) return;
    if (!canvasRef || !canvasRef.current) return;

    const { canvasCtx } = getCanvasContext(canvasRef);

    // clear
    canvasCtx.clearRect(0, 0, contentWidth, contentHeight);

    // グラフの範囲外に出たら消したままにする
    if (
      position.x < CANVAS_PADDING ||
      position.x > contentWidth - CANVAS_PADDING ||
      position.y < CANVAS_PADDING ||
      position.y > contentHeight - VERTICAL_SCALE_HEIGHT
    ) {
      return;
    }

    // カーソル位置のバーを描画
    drawLine(
      canvasCtx,
      position.x,
      CANVAS_PADDING,
      0,
      graphHeight,
      Color.DeepSlate
    );

    // カーソル位置の時刻を描画
    const sec = getCursorSecond(
      canvasWidth,
      graphWidth,
      zoomLevel,
      audioBuffer.duration,
      position.x,
      scrollLeft
    );
    const x = position.x > contentWidth / 2 ? position.x - 36 : position.x + 8;
    drawText(
      canvasCtx,
      x,
      contentHeight - VERTICAL_SCALE_HEIGHT - 16,
      getTimeStr(sec),
      Font.Default,
      Color.DeepSlate
    );
  }, [position, canvasWidth, scrollLeft]);
};

/**
 * マウスで範囲選択された箇所を配列にする
 * @param selecting
 * @param position
 * @param zoomLevel
 * @param drewWaves
 * @param canvasRef
 * @returns
 */
const useSelectRange = (
  selecting: boolean,
  position: { [key: string]: number },
  zoomLevel: number,
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
    const frameWidth = canvasWidth / zoomLevel;
    const unscaledPosX = Math.round(position.x / zoomLevel);

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

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export {
  useFrameCanvasSetup,
  useWavesCanvasSetup,
  useDecorationCanvasSetup,
  useMouseCanvasSetup,
  useCoverCanvasSetup,
  useCanvasClear,
  useCursorEffect,
  useSelectRange,
};
