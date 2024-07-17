import { RefObject } from "react";
import { getMaxValues, sliceAudioBuffer } from "./functions.audio";
import {
  CANVAS_PADDING,
  GRAPH_PADDING,
  Color,
  VERTICAL_SCALE_HEIGHT,
} from "./constants";
import { getTimeStr } from "./functions.time";
import { scaling, sliceByNumber } from "./functions.common";

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
  canvasCtx.clearRect(
    CANVAS_PADDING,
    CANVAS_PADDING,
    canvasWidth - CANVAS_PADDING * 2,
    canvasHeight - CANVAS_PADDING * 2
  );
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Draw frame
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
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
  canvasCtx.font = "10px serif";
  canvasCtx.fillText(
    frequency ? `${frequency}Hz` : "Synthesis",
    GRAPH_PADDING,
    GRAPH_PADDING
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
 * @param canvasRef
 * @param normalize
 * @param canvasWavesWidth
 * @param samplingLevel
 * @returns
 */
const drawWaveStereo = (
  audioBuffer: AudioBuffer | null,
  canvasRef: RefObject<HTMLCanvasElement> | null,
  normalize: boolean,
  canvasWavesWidth: number,
  samplingLevel: number
) => {
  if (!audioBuffer) return;
  if (!canvasRef || !canvasRef.current) return;
  console.info("[info] drawing: waves");

  // canvasのサイズを変更してスケールを表現
  const { buffer, scales } = scaling(audioBuffer);

  // どれくらいの詳細度で描画するか（以下は1/10秒）
  const stepInterval = buffer.sampleRate * samplingLevel;
  console.debug(`sampling level: ${samplingLevel}, interval: ${stepInterval}`);

  // canvasの取得
  const canvasWidth = canvasWavesWidth;
  const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);

  // graph frame size
  const graphWidth = canvasWidth - CANVAS_PADDING * 2;
  const graphHeight =
    (canvasHeight - CANVAS_PADDING * 3 - VERTICAL_SCALE_HEIGHT) / 2;

  // step size
  const stepWidth =
    (graphWidth - GRAPH_PADDING * 2) /
    (buffer.getChannelData(0).length / stepInterval);
  const stepHeight = graphHeight - GRAPH_PADDING * 2;

  // clear previous waves
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  // prepare normalize
  const max = getMaxValues(audioBuffer);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    let channelData = buffer.getChannelData(i);
    if (normalize && max[i]) {
      console.debug(`max[${i}]: ${max[i]}`);
      channelData = channelData.map((a: number) => {
        return a / max[i];
      });
    }
    const centerHeight =
      CANVAS_PADDING * (i * 1) + graphHeight * i + graphHeight / 2;

    let prePos = {
      x: CANVAS_PADDING + GRAPH_PADDING,
      y: centerHeight,
    };
    for (let j = 0; j < channelData.length; j = j + stepInterval) {
      const amp = channelData[j] * (stepHeight / 2);

      const curPos = {
        x: CANVAS_PADDING + GRAPH_PADDING + stepWidth * (j / stepInterval),
        y: centerHeight - amp,
      };

      // draw horizontal scale
      if (j in scales) {
        // console.debug(`draw scale [${j}:${scales[j]}]`);
        const y = graphHeight * i + CANVAS_PADDING * (i + 1);
        canvasCtx.strokeStyle = Color.DeepSlate;
        canvasCtx.lineWidth = 0.2;
        canvasCtx.beginPath();
        canvasCtx.moveTo(curPos.x, y);
        canvasCtx.lineTo(curPos.x, y + graphHeight);
        canvasCtx.closePath();
        canvasCtx.stroke();
        // 初回のみ目盛り文字を描画
        if (i === 0) {
          const scaleY = canvasHeight - VERTICAL_SCALE_HEIGHT + 8;
          canvasCtx.font = "10px serif";
          canvasCtx.fillText(getTimeStr(scales[j]), curPos.x, scaleY);
        }
      }

      if (j === 0) {
        // 先頭は値を入れておくのみにする（0位置の設定のため）
        prePos = curPos;
        continue;
      }

      // 波形の描画
      canvasCtx.strokeStyle = Color.SkyBlueCyan;
      canvasCtx.lineWidth = 0.5;
      canvasCtx.beginPath();
      canvasCtx.moveTo(prePos.x, prePos.y);
      canvasCtx.lineTo(curPos.x, curPos.y);
      canvasCtx.stroke();
      prePos = curPos;
    }
  }
};

/**
 * 波形を描画する
 * @param audioBuffer
 * @param canvasRef
 * @param normalize
 * @param canvasWavesWidth
 * @param samplingLevel
 * @returns
 */
const drawWavesStereoToMono = (
  audioBuffer: AudioBuffer | null,
  canvasRef: RefObject<HTMLCanvasElement> | null,
  normalize: boolean,
  canvasWavesWidth: number,
  samplingLevel: number
) => {
  if (!audioBuffer) return;
  if (!canvasRef || !canvasRef.current) return;
  console.info("[info] drawing: stereo waves");

  // canvasのサイズを変更してスケールを表現
  const { buffer, scales } = scaling(audioBuffer);

  // どれくらいの詳細度で描画するか（以下は1/10秒）
  const stepInterval = buffer.sampleRate * samplingLevel;
  console.debug(`sampling level: ${samplingLevel}, interval: ${stepInterval}`);

  // canvasの取得
  const canvasWidth = canvasWavesWidth;
  const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);
  console.debug(`canvasWidth: ${canvasWidth}, canvasHeight: ${canvasHeight}`);

  // graph frame size
  const graphWidth = canvasWidth - CANVAS_PADDING * 2;
  const graphHeight = canvasHeight - CANVAS_PADDING * 2 - VERTICAL_SCALE_HEIGHT;
  console.debug(`graphWidth: ${graphWidth}, graphHeight: ${graphHeight}`);

  // step size
  const stepWidth =
    (graphWidth - GRAPH_PADDING * 2) /
    (buffer.getChannelData(0).length / stepInterval);
  const stepHeight = graphHeight - GRAPH_PADDING * 2;

  // clear previous waves
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  // prepare normalize
  const max = getMaxValues(audioBuffer);

  // bufferからステレオそれぞれのデータを取り出す
  const channelDataLeft = buffer.getChannelData(0);
  const channelDataRight = buffer.getChannelData(1);
  const numberOfSamples = buffer.length;

  // 左右のチャンネルのデータを加算し、平均を取ることでモノラル波形を作成する
  const waveformData = new Float32Array(numberOfSamples);
  for (let i = 0; i < numberOfSamples; i++) {
    waveformData[i] = (channelDataLeft[i] + channelDataRight[i]) / 2;
  }

  const centerHeight = CANVAS_PADDING + graphHeight / 2;

  let prePos = {
    x: CANVAS_PADDING + GRAPH_PADDING,
    y: centerHeight,
  };

  for (let j = 0; j < waveformData.length; j = j + stepInterval) {
    const amp = waveformData[j] * (stepHeight / 2);

    const curPos = {
      x: CANVAS_PADDING + GRAPH_PADDING + stepWidth * (j / stepInterval),
      y: centerHeight - amp,
    };

    // draw horizontal scale
    if (j in scales) {
      // console.debug(`draw scale [${j}:${scales[j]}]`);
      const y = CANVAS_PADDING;
      canvasCtx.strokeStyle = Color.DeepSlate;
      canvasCtx.lineWidth = 0.2;
      canvasCtx.beginPath();
      canvasCtx.moveTo(curPos.x, y);
      canvasCtx.lineTo(curPos.x, y + graphHeight);
      canvasCtx.closePath();
      canvasCtx.stroke();
      // 目盛り文字を描画
      const scaleY = canvasHeight - VERTICAL_SCALE_HEIGHT + 8;
      canvasCtx.font = "10px serif";
      canvasCtx.fillText(getTimeStr(scales[j]), curPos.x, scaleY);
    }

    if (j === 0) {
      // 先頭は値を入れておくのみにする（0位置の設定のため）
      prePos = curPos;
      continue;
    }

    // 波形の描画
    canvasCtx.strokeStyle = Color.SkyBlueCyan;
    canvasCtx.lineWidth = 0.5;
    canvasCtx.beginPath();
    canvasCtx.moveTo(prePos.x, prePos.y);
    canvasCtx.lineTo(curPos.x, curPos.y);
    canvasCtx.stroke();
    prePos = curPos;
  }
};

/**
 * 波形を描画する
 * @param audioBuffer
 * @param canvasRef
 * @param normalize
 * @param canvasWavesWidth
 * @param samplingLevel
 * @returns
 */
const drawWaves = (
  audioBuffer: AudioBuffer | null,
  canvasRef: RefObject<HTMLCanvasElement> | null,
  normalize: boolean,
  canvasWavesWidth: number,
  samplingLevel: number
) => {
  if (!audioBuffer) return;
  if (!canvasRef || !canvasRef.current) return;
  console.info("[info] drawing: stereo waves");

  // canvasのサイズを変更してスケールを表現
  const { buffer, scales } = scaling(audioBuffer);

  // どれくらいの詳細度で描画するか（以下は1/10秒）
  const stepInterval = buffer.sampleRate * samplingLevel;
  console.debug(`sampling level: ${samplingLevel}, interval: ${stepInterval}`);

  // canvasの取得
  const canvasWidth = canvasWavesWidth;
  const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);
  console.debug(`canvasWidth: ${canvasWidth}, canvasHeight: ${canvasHeight}`);

  // graph frame size
  const graphWidth = canvasWidth - CANVAS_PADDING * 2;
  const graphHeight = canvasHeight - CANVAS_PADDING * 2 - VERTICAL_SCALE_HEIGHT;
  console.debug(`graphWidth: ${graphWidth}, graphHeight: ${graphHeight}`);

  // step size
  const stepWidth =
    (graphWidth - GRAPH_PADDING * 2) /
    (buffer.getChannelData(0).length / stepInterval);
  const stepHeight = graphHeight - GRAPH_PADDING * 2;

  // clear previous waves
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  // prepare normalize
  const max = getMaxValues(audioBuffer);

  // bufferからモノラルのデータを取り出す
  const channelData = buffer.getChannelData(0);

  const centerHeight = CANVAS_PADDING + graphHeight / 2;

  let prePos = {
    x: CANVAS_PADDING + GRAPH_PADDING,
    y: centerHeight,
  };

  for (let j = 0; j < channelData.length; j = j + stepInterval) {
    const amp = channelData[j] * (stepHeight / 2);

    const curPos = {
      x: CANVAS_PADDING + GRAPH_PADDING + stepWidth * (j / stepInterval),
      y: centerHeight - amp,
    };

    // draw horizontal scale
    if (j in scales) {
      // console.debug(`draw scale [${j}:${scales[j]}]`);
      const y = CANVAS_PADDING;
      canvasCtx.strokeStyle = Color.DeepSlate;
      canvasCtx.lineWidth = 0.2;
      canvasCtx.beginPath();
      canvasCtx.moveTo(curPos.x, y);
      canvasCtx.lineTo(curPos.x, y + graphHeight);
      canvasCtx.closePath();
      canvasCtx.stroke();
      // 目盛り文字を描画
      const scaleY = canvasHeight - VERTICAL_SCALE_HEIGHT + 8;
      canvasCtx.font = "10px serif";
      canvasCtx.fillText(getTimeStr(scales[j]), curPos.x, scaleY);
    }

    if (j === 0) {
      // 先頭は値を入れておくのみにする（0位置の設定のため）
      prePos = curPos;
      continue;
    }

    // 波形の描画
    canvasCtx.strokeStyle = Color.SkyBlueCyan;
    canvasCtx.lineWidth = 0.5;
    canvasCtx.beginPath();
    canvasCtx.moveTo(prePos.x, prePos.y);
    canvasCtx.lineTo(curPos.x, curPos.y);
    canvasCtx.stroke();
    prePos = curPos;
  }
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
 * @param scale
 * @returns
 */
const drawSelectedRange = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  canvasWavesWidth: number,
  ranges: number[],
  position: { [key: string]: number },
  selecting: boolean,
  scale: number
) => {
  if (!canvasRef || !canvasRef.current) return;

  const canvasWidth = canvasWavesWidth;
  const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);

  // clear
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 選択された範囲を描画する
  const scaledRanges = ranges.map((r: number) => {
    return Math.round(r * scale);
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
 * 範囲選択された部分を描画する
 * @param canvasRef
 * @param canvasWavesWidth
 * @param annotations
 * @param position
 * @param selecting
 * @param scale
 * @returns
 */
// const drawAnnotations = (
//   canvasRef: RefObject<HTMLCanvasElement> | null,
//   canvasWavesWidth: number,
//   annotations: Annotation[],
//   position: { [key: string]: number },
//   selecting: boolean,
//   scale: number
// ) => {
//   if (!canvasRef || !canvasRef.current) return;

//   const canvasWidth = canvasWavesWidth;
//   const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);

//   // clear
//   canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

//   // 選択された範囲を描画する
//   const scaledAnnotations = annotations.map((annotation: Annotation) => {
//     return {
//       startIdx: Math.round(annotation.startTime * scale)
//     };
//   });
//   const rescaleRanges = sliceByNumber(scaledRanges, 2);
//   canvasCtx.fillStyle = Color.DustyRose;
//   canvasCtx.globalAlpha = 0.3;
//   canvasCtx.beginPath();
//   for (const range of rescaleRanges) {
//     if (range.length === 2) {
//       canvasCtx.fillRect(
//         range[0],
//         CANVAS_PADDING,
//         range[1] - range[0],
//         canvasHeight - CANVAS_PADDING * 2 - VERTICAL_SCALE_HEIGHT
//       );
//     } else {
//       if (selecting) {
//         // 他の選択範囲に重なってしまわないようにする
//         let start = range[0];
//         let end = position.x;
//         for (const check of rescaleRanges) {
//           if (check.length === 2) {
//             if (check[1] < range[0] && position.x <= check[1]) {
//               start = check[1] + 2;
//               end = range[0];
//             }
//             if (range[0] < check[0] && check[0] <= position.x) {
//               end = check[0] - 2;
//             }
//           }
//         }
//         canvasCtx.fillRect(
//           start,
//           CANVAS_PADDING,
//           end - start,
//           canvasHeight - CANVAS_PADDING * 2 - VERTICAL_SCALE_HEIGHT
//         );
//       }
//     }
//   }
//   canvasCtx.closePath();
//   canvasCtx.fill();
// };

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export {
  getCanvasContext,
  clearCanvas,
  drawRect,
  drawWavePeriod,
  drawWaveStereo,
  drawWavesStereoToMono,
  drawWaves,
  drawSelectedRange,
};
