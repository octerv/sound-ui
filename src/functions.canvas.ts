import { RefObject } from "react";
import { sliceAudioBuffer } from "./functions.audio";
import {
  CANVAS_PADDING,
  GRAPH_PADDING,
  Color,
  VERTICAL_SCALE_HEIGHT,
  Font,
  MIN_LABEL_WIDTH,
} from "./constants";
import { getTimePosition } from "./functions.time";
import { sliceByNumber } from "./functions.common";
import { Annotation } from "sound-ui/types";

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

/**
 * 指定されたcanvasRefが示すHTMLCanvasElementをクリアします。
 * canvasRefがnullまたは未定義の場合、何もしません。
 * CANVAS_PADDINGを考慮して、キャンバスの描画領域全体をクリアします。
 *
 * @param {RefObject<HTMLCanvasElement> | null} canvasRef - クリアするキャンバスへの参照。
 */
const clearCanvas = (canvasRef: RefObject<HTMLCanvasElement> | null) => {
  // clear canvas
  if (!canvasRef || !canvasRef.current) return;
  let { canvasCtx, canvasWidth, canvasHeight } = getCanvasContext(canvasRef);
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Draw object
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
/**
 * 指定されたパラメータに基づいてキャンバスに矩形を描画する関数です。
 * この関数では矩形の位置、大きさ、および色を指定できます。また、透明度と線の太さも設定されています。
 *
 * @param {CanvasRenderingContext2D} canvasCtx - 描画に使用するキャンバスのコンテキスト。
 * @param {number} left - 矩形の左端のX座標。
 * @param {number} top - 矩形の上端のY座標。
 * @param {number} width - 矩形の幅。
 * @param {number} height - 矩形の高さ。
 * @param {string} color - 矩形の枠線の色。
 *
 * 描画される矩形は、指定された色で、透明度は0.8、線の太さは0.5ピクセルです。
 * 矩形の位置とサイズは、left, top, width, height によって指定されます。
 */
const drawRect = (
  canvasCtx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  color: string
) => {
  canvasCtx.globalAlpha = 0.8;
  canvasCtx.lineWidth = 0.5;
  canvasCtx.strokeStyle = color;
  canvasCtx.beginPath();
  canvasCtx.rect(left, top, width, height);
  canvasCtx.closePath();
  canvasCtx.stroke();
};

/**
 * 指定されたパラメータに基づいてキャンバスに塗りつぶされた矩形を描画する関数です。
 * この関数では矩形の位置、大きさ、色、および透明度を指定できます。
 *
 * @param {CanvasRenderingContext2D} canvasCtx - 描画に使用するキャンバスのコンテキスト。
 * @param {number} left - 矩形の左端のX座標。
 * @param {number} top - 矩形の上端のY座標。
 * @param {number} width - 矩形の幅。
 * @param {number} height - 矩形の高さ。
 * @param {string} color - 矩形を塗りつぶす色。
 *
 * 描画される矩形は指定された色で塗りつぶされ、透明度は0.3に設定されます。
 * 線の太さは0.0ピクセルとして、実質的に枠線は描画されません。
 */
const drawFillRect = (
  canvasCtx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  color: string
) => {
  canvasCtx.globalAlpha = 0.3;
  canvasCtx.lineWidth = 0.0;
  canvasCtx.fillStyle = color;
  canvasCtx.beginPath();
  canvasCtx.fillRect(left, top, width, height);
  canvasCtx.closePath();
  canvasCtx.fill();
};

/**
 * 指定されたパラメータに基づいてキャンバスに直線を描画する関数です。
 * この関数では線の開始点と終了点、色、透明度、および線の太さを指定できます。
 *
 * @param {CanvasRenderingContext2D} canvasCtx - 描画に使用するキャンバスのコンテキスト。
 * @param {number} left - 線の開始点のX座標。
 * @param {number} top - 線の開始点のY座標。
 * @param {number} width - 線の終了点までのX方向の距離。
 * @param {number} height - 線の終了点までのY方向の距離。
 * @param {string} color - 線の色。
 *
 * 関数は指定された開始点から幅と高さに基づく終了点まで線を描画します。
 * 描画される線は指定された色で、透明度は0.8、線の太さは1.0ピクセルです。
 */
const drawLine = (
  canvasCtx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  color: string
) => {
  canvasCtx.strokeStyle = color;
  canvasCtx.globalAlpha = 0.8;
  canvasCtx.lineWidth = 1.0;
  canvasCtx.beginPath();
  canvasCtx.moveTo(left, top);
  canvasCtx.lineTo(left + width, top + height);
  canvasCtx.closePath();
  canvasCtx.stroke();
};

/**
 * Draws text on a given canvas context at specified coordinates.
 *
 * @param {CanvasRenderingContext2D} canvasCtx - The canvas rendering context where the text will be drawn.
 * @param {number} x - The x-coordinate of the text's starting point.
 * @param {number} y - The y-coordinate of the text's starting point.
 * @param {string} text - The text string to be drawn. If the text contains '\n', it will be split into multiple lines and each line will be drawn separately.
 * @param {string} font - The font style to be applied to the text (e.g., "16px Arial").
 * @param {string} color - The fill color of the text.
 * @param {CanvasTextAlign} [textAlign="start"] - The alignment of the text relative to the x-coordinate. Default is "start".
 */
const drawText = (
  canvasCtx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  font: string,
  color: string,
  textAlign: CanvasTextAlign = "start"
) => {
  canvasCtx.globalAlpha = 0.9;
  canvasCtx.font = font;
  canvasCtx.fillStyle = color;
  canvasCtx.textAlign = textAlign;
  canvasCtx.fillText(text, x, y);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Draw wave
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
/**
 * 指定されたオーディオバッファから特定の期間の波形をキャンバスに描画します。
 * この関数は、波形を視覚化し、オーディオデータの一部をグラフとして表示するために使用されます。
 *
 * @param audioBuffer - 描画する波形データを含むAudioBuffer。nullの場合、処理は実行されません。
 * @param canvasRef - 描画対象となるHTMLCanvasElementの参照。nullまたは未初期化の場合、処理は実行されません。
 * @param period - 描画する期間（秒単位）。この期間に基づきAudioBufferからデータが切り出されます。
 * @param frequency - オプショナル。波形の基本周波数（Hz）。指定されない場合、'Synthesis'と表示されます。
 *
 * 処理の詳細：
 * 1. キャンバスとそのコンテキストを取得し、描画領域の大きさを設定します。
 * 2. 指定された期間に基づきAudioBufferから波形データを切り出します。
 * 3. 切り出したデータの長さに応じて、キャンバスに描画するステップ間隔を計算します。
 * 4. 波形をキャンバスに描画します。波形は中心線からの振幅で表示され、周波数がオプショナルでラベルとして追加されます。
 *
 * 注意点：
 * - 描画される波形は単一チャンネルのデータを使用します（通常、チャンネル0）。
 * - キャンバスのサイズやパディングは関数内で定義された定数に依存します。
 * - 描画性能はキャンバスのサイズとデータの量に依存します。大きなデータセットや高解像度のキャンバスで性能問題が発生する可能性があります。
 */

const drawWavePeriod = (
  audioBuffer: AudioBuffer | null,
  canvasRef: RefObject<HTMLCanvasElement> | null,
  period: number,
  frequency?: number
) => {
  if (!audioBuffer) return;
  if (!canvasRef || !canvasRef.current) return;
  console.info("[info] drawing: wave period");
  console.info(`[info] frequency:${frequency}, period:${period}`);
  // canvasの取得
  const { canvasCtx, canvasWidth, canvasHeight } = getCanvasContext(canvasRef);

  // graph frame size
  const graphWidth = canvasWidth - CANVAS_PADDING * 2;
  const graphHeight = canvasHeight - CANVAS_PADDING * 2;

  // 指定秒数で切り出し
  const buffer = sliceAudioBuffer(audioBuffer, 0, period);
  // どれくらいの詳細度で描画するか（以下は1/10秒）
  const stepInterval =
    buffer.length >= graphWidth ? Math.floor(buffer.length / graphWidth) : 1;
  console.debug(`length:${buffer.length}, interval:${stepInterval}`);

  // step size
  const stepWidth = Math.floor(graphWidth / buffer.length);
  const stepHeight = Math.floor(graphHeight - GRAPH_PADDING * 2);
  const stepHeightHalf = Math.floor(stepHeight / 2);
  console.debug(
    `stepWidth:${stepWidth}, stepHeight:${stepHeight}, half:${stepHeightHalf}`
  );

  let channelData = buffer.getChannelData(0);
  const centerHeight = CANVAS_PADDING + graphHeight / 2;

  // 中心線の描画
  canvasCtx.strokeStyle = Color.DeepSlate;
  canvasCtx.lineWidth = 1;
  canvasCtx.beginPath();
  canvasCtx.moveTo(CANVAS_PADDING, centerHeight);
  canvasCtx.lineTo(CANVAS_PADDING + graphWidth, centerHeight);
  canvasCtx.closePath();
  canvasCtx.stroke();

  // 周波数表示
  drawText(
    canvasCtx,
    GRAPH_PADDING,
    GRAPH_PADDING,
    frequency ? `${frequency}Hz` : "Synthesis",
    Font.Small,
    Color.DeepSlate
  );

  let prePos = {
    x: CANVAS_PADDING + GRAPH_PADDING,
    y: centerHeight,
  };
  for (let i = 0; i < channelData.length; i = i + stepInterval) {
    const amp = channelData[i] * stepHeightHalf;

    const curPos = {
      x: CANVAS_PADDING + GRAPH_PADDING + stepWidth * (i / stepInterval),
      y: centerHeight - amp,
    };

    if (i === 0) {
      // 先頭は値を入れておくのみにする（0位置の設定のため）
      prePos = curPos;
      continue;
    }

    // 波形の描画
    canvasCtx.strokeStyle = Color.SkyBlueCyan;
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();
    canvasCtx.moveTo(prePos.x, prePos.y);
    canvasCtx.lineTo(curPos.x, curPos.y);
    canvasCtx.stroke();
    prePos = curPos;
  }
};

/**
 * 波形を描画する（ステレオ）
 * @param audioBuffer
 * @param canvasWidth
 * @param canvasHeight
 * @param samplingLevel
 * @returns
 */
const drawWaveStereo = (
  audioBuffer: AudioBuffer | null,
  canvasWidth: number,
  canvasHeight: number,
  samplingLevel: number
): HTMLCanvasElement | null => {
  if (!audioBuffer) return null;
  console.info("[info] drawing: waves");

  // どれくらいの詳細度で描画するか（以下は1/10秒）
  const stepInterval = audioBuffer.sampleRate * samplingLevel;

  // canvasの取得
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvasWidth;
  offscreenCanvas.height = canvasHeight;
  const canvasCtx = offscreenCanvas.getContext("2d");
  if (!canvasCtx) return null;

  // graph frame size
  const graphWidth = canvasWidth;
  const graphHeight = canvasHeight / audioBuffer.numberOfChannels;

  // step size
  const stepWidth =
    graphWidth / (audioBuffer.getChannelData(0).length / stepInterval);
  const stepHeight = graphHeight;

  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    let channelData = audioBuffer.getChannelData(i);
    const centerHeight = graphHeight * i + graphHeight / 2;

    let previousPosition = {
      x: 0,
      y: centerHeight,
    };
    for (let j = 0; j < channelData.length; j = j + stepInterval) {
      const amp = channelData[j] * (stepHeight / 2);

      const currentPosition = {
        x: stepWidth * (j / stepInterval),
        y: centerHeight - amp,
      };

      if (j === 0) {
        // 先頭は値を入れておくのみにする（0位置の設定のため）
        previousPosition = currentPosition;
        continue;
      }

      // 波形の描画
      canvasCtx.strokeStyle = Color.SkyBlueCyan;
      canvasCtx.lineWidth = 0.5;
      canvasCtx.beginPath();
      canvasCtx.moveTo(previousPosition.x, previousPosition.y);
      canvasCtx.lineTo(currentPosition.x, currentPosition.y);
      canvasCtx.stroke();
      previousPosition = currentPosition;
    }
  }

  return offscreenCanvas;
};

/**
 * 波形を描画する
 * @param audioBuffer
 * @param canvasWidth
 * @param canvasHeight
 * @param samplingLevel
 * @returns
 */
const drawWavesStereoToMono = (
  audioBuffer: AudioBuffer | null,
  canvasWidth: number,
  canvasHeight: number,
  samplingLevel: number
): HTMLCanvasElement | null => {
  if (!audioBuffer) return null;
  console.info("[info] drawing: stereo to mono");

  // どれくらいの詳細度で描画するか（以下は1/10秒）
  const stepInterval = audioBuffer.sampleRate * samplingLevel;

  // canvasの取得
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvasWidth;
  offscreenCanvas.height = canvasHeight;
  const canvasCtx = offscreenCanvas.getContext("2d");
  if (!canvasCtx) return null;

  // graph frame size
  const graphWidth = canvasWidth;
  const graphHeight = canvasHeight;

  // step size
  const stepWidth =
    graphWidth / (audioBuffer.getChannelData(0).length / stepInterval);
  const stepHeight = graphHeight;

  // bufferからステレオそれぞれのデータを取り出す
  const channelDataLeft = audioBuffer.getChannelData(0);
  const channelDataRight = audioBuffer.getChannelData(1);
  const numberOfSamples = audioBuffer.length;

  // 左右のチャンネルのデータを加算し、平均を取ることでモノラル波形を作成する
  const waveformData = new Float32Array(numberOfSamples);
  for (let i = 0; i < numberOfSamples; i++) {
    waveformData[i] = (channelDataLeft[i] + channelDataRight[i]) / 2;
  }

  const centerHeight = graphHeight / 2;

  let previousPosition = {
    x: 0,
    y: centerHeight,
  };
  for (let j = 0; j < waveformData.length; j = j + stepInterval) {
    const amp = waveformData[j] * (stepHeight / 2);

    const currentPosition = {
      x: stepWidth * (j / stepInterval),
      y: centerHeight - amp,
    };

    if (j === 0) {
      // 先頭は値を入れておくのみにする（0位置の設定のため）
      previousPosition = currentPosition;
      continue;
    }

    // 波形の描画
    canvasCtx.strokeStyle = Color.SkyBlueCyan;
    canvasCtx.lineWidth = 0.5;
    canvasCtx.beginPath();
    canvasCtx.moveTo(previousPosition.x, previousPosition.y);
    canvasCtx.lineTo(currentPosition.x, currentPosition.y);
    canvasCtx.stroke();
    previousPosition = currentPosition;
  }

  return offscreenCanvas;
};

/**
 * 波形を描画する
 * @param audioBuffer
 * @param canvasWidth
 * @param canvasHeight
 * @param samplingLevel
 * @returns
 */
const drawWaves = (
  audioBuffer: AudioBuffer | null,
  canvasWidth: number,
  canvasHeight: number,
  samplingLevel: number
): HTMLCanvasElement | null => {
  if (!audioBuffer) return null;
  console.info("[info] drawing: stereo waves");

  // どれくらいの詳細度で描画するか（以下は1/10秒）
  const stepInterval = audioBuffer.sampleRate * samplingLevel;

  // canvasの取得
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvasWidth;
  offscreenCanvas.height = canvasHeight;
  const canvasCtx = offscreenCanvas.getContext("2d");
  if (!canvasCtx) return null;

  // graph frame size
  const graphWidth = canvasWidth;
  const graphHeight = canvasHeight / audioBuffer.numberOfChannels;

  // step size
  const stepWidth =
    graphWidth / (audioBuffer.getChannelData(0).length / stepInterval);
  const stepHeight = graphHeight;

  // bufferからモノラルのデータを取り出す
  const channelData = audioBuffer.getChannelData(0);

  const centerHeight = CANVAS_PADDING + graphHeight / 2;

  let previousPosition = {
    x: 0,
    y: centerHeight,
  };
  for (let j = 0; j < channelData.length; j = j + stepInterval) {
    const amp = channelData[j] * (stepHeight / 2);

    const currentPosition = {
      x: stepWidth * (j / stepInterval),
      y: centerHeight - amp,
    };

    if (j === 0) {
      // 先頭は値を入れておくのみにする（0位置の設定のため）
      previousPosition = currentPosition;
      continue;
    }

    // 波形の描画
    canvasCtx.strokeStyle = Color.SkyBlueCyan;
    canvasCtx.lineWidth = 0.5;
    canvasCtx.beginPath();
    canvasCtx.moveTo(previousPosition.x, previousPosition.y);
    canvasCtx.lineTo(currentPosition.x, currentPosition.y);
    canvasCtx.stroke();
    previousPosition = currentPosition;
  }

  return offscreenCanvas;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Draw annotation
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
/**
 * 範囲選択された部分を描画する
 * @param canvasRef
 * @param canvasWavesWidth
 * @param ranges
 * @param position
 * @param selecting
 * @param zoomLevel
 * @returns
 */
const drawSelectedRange = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  ranges: number[],
  position: { [key: string]: number },
  selecting: boolean,
  zoomLevel: number
) => {
  if (!canvasRef || !canvasRef.current) return;
  const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);
  if (ranges.length === 2) {
    canvasCtx.clearRect(ranges[0], 0, ranges[1] - ranges[0], canvasHeight);
  }

  // 選択された範囲を描画する
  const scaledRanges = ranges.map((r: number) => {
    return Math.round(r * zoomLevel);
  });
  const rescaleRanges = sliceByNumber(scaledRanges, 2);
  canvasCtx.fillStyle = Color.DustyRose;
  canvasCtx.globalAlpha = 0.3;
  canvasCtx.beginPath();
  for (const range of rescaleRanges) {
    if (range.length === 2) {
      canvasCtx.fillRect(
        range[0],
        CANVAS_PADDING,
        range[1] - range[0],
        canvasHeight - CANVAS_PADDING * 2 - VERTICAL_SCALE_HEIGHT
      );
    } else {
      if (selecting) {
        // 他の選択範囲に重なってしまわないようにする
        let start = range[0];
        let end = position.x;
        for (const check of rescaleRanges) {
          if (check.length === 2) {
            if (check[1] < range[0] && position.x <= check[1]) {
              start = check[1] + 2;
              end = range[0];
            }
            if (range[0] < check[0] && check[0] <= position.x) {
              end = check[0] - 2;
            }
          }
        }
        canvasCtx.fillRect(
          start,
          CANVAS_PADDING,
          end - start,
          canvasHeight - CANVAS_PADDING * 2 - VERTICAL_SCALE_HEIGHT
        );
      }
    }
  }
  canvasCtx.closePath();
  canvasCtx.fill();
};

/**
 * アノテーションを描画する
 * @param canvasWidth
 * @param canvasHeight
 * @param samplingLevel
 * @returns
 */
const drawAnnotations = (
  canvasWidth: number,
  canvasHeight: number,
  duration: number,
  annotations: Annotation[],
  classes: string[],
  confThreshold: number
): HTMLCanvasElement | null => {
  // canvasの取得
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvasWidth;
  offscreenCanvas.height = canvasHeight;
  const canvasCtx = offscreenCanvas.getContext("2d");
  if (!canvasCtx) return null;

  // 選択された範囲を描画する
  for (const annotation of annotations) {
    if (annotation.confidence < confThreshold) continue;
    const { x: x0, y: y0 } = getTimePosition(
      canvasWidth,
      duration,
      annotation.startTime
    );
    const { x: x1, y: y1 } = getTimePosition(
      canvasWidth,
      duration,
      annotation.endTime
    );
    const w = x1 - x0;
    drawFillRect(canvasCtx, x0, y0, w, canvasHeight, Color.DustyRose);
    if (annotation.label !== "" && w >= MIN_LABEL_WIDTH) {
      let labelY = y0 + canvasHeight / 2;
      if (classes.length > 0) {
        // classesが指定されている場合に高さを調整
        const labelInterval = canvasHeight / classes.length;
        const labelIdx = classes.indexOf(annotation.label);
        labelY = y0 + canvasHeight - labelInterval * (labelIdx + 1);
      }
      drawText(
        canvasCtx,
        x0 + w / 2,
        labelY,
        annotation.label,
        Font.Annotation,
        Color.DeepSlate,
        "center"
      );
      drawText(
        canvasCtx,
        x0 + w / 2,
        labelY + 13,
        annotation.confidence.toFixed(2),
        Font.Default,
        Color.DeepSlate,
        "center"
      );
    }
  }

  return offscreenCanvas;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export {
  getCanvasContext,
  clearCanvas,
  drawRect,
  drawFillRect,
  drawLine,
  drawText,
  drawWavePeriod,
  drawWaveStereo,
  drawWavesStereoToMono,
  drawWaves,
  drawSelectedRange,
  drawAnnotations,
};
