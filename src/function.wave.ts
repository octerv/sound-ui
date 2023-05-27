import { RefObject } from "react";
import { getCanvasContext } from "./functions";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Private
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const _sliceAudioBuffer = (
  audioBuffer: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer => {
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.min(
    Math.ceil(endTime * sampleRate),
    audioBuffer.length
  );
  const newBufferLength = endSample - startSample;

  const audioContext = new AudioContext();
  const newAudioBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    newBufferLength,
    sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const newChannelData = newAudioBuffer.getChannelData(channel);

    for (let i = startSample, j = 0; i < endSample; i++, j++) {
      newChannelData[j] = channelData[i];
    }
  }

  return newAudioBuffer;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Public
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const getMaxValue = (audioBuffer: AudioBuffer): number => {
  let max = 0;
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    max = audioBuffer.getChannelData(i).reduce((a, b) => {
      const aa: number = a < 0 ? -a : a;
      const bb: number = b < 0 ? -b : b;
      return Math.max(aa, bb);
    }, 0);
  }
  return max;
};

const normalizeValue = (
  audioBuffer: AudioBuffer,
  maxValue: number
): AudioBuffer => {
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const channelData = audioBuffer.getChannelData(i);
    for (let j = 0; j < channelData.length; j++) {
      channelData[j] = channelData[j] / maxValue;
    }
  }
  return audioBuffer;
};

const drawWavePeriod = (
  audioBuffer: AudioBuffer | null,
  canvasRef: RefObject<HTMLCanvasElement> | null,
  constants: { [key: string]: any },
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
  const graphWidth = canvasWidth - constants.CANVAS_PADDING * 2;
  const graphHeight = canvasHeight - constants.CANVAS_PADDING * 2;

  // 指定秒数で切り出し
  const buffer = _sliceAudioBuffer(audioBuffer, 0, period);
  // どれくらいの詳細度で描画するか（以下は1/10秒）
  const stepInterval =
    buffer.length >= graphWidth ? Math.floor(buffer.length / graphWidth) : 1;
  console.debug(`length:${buffer.length}, interval:${stepInterval}`);

  // step size
  const stepWidth = Math.floor(graphWidth / buffer.length);
  const stepHeight = Math.floor(graphHeight - constants.GRAPH_PADDING * 2);
  const stepHeightHalf = Math.floor(stepHeight / 2);
  console.debug(
    `stepWidth:${stepWidth}, stepHeight:${stepHeight}, half:${stepHeightHalf}`
  );

  let channelData = buffer.getChannelData(0);
  const centerHeight = constants.CANVAS_PADDING + graphHeight / 2;

  // 中心線の描画
  canvasCtx.strokeStyle = "#2F4147";
  canvasCtx.lineWidth = 1;
  canvasCtx.beginPath();
  canvasCtx.moveTo(constants.CANVAS_PADDING, centerHeight);
  canvasCtx.lineTo(constants.CANVAS_PADDING + graphWidth, centerHeight);
  canvasCtx.closePath();
  canvasCtx.stroke();

  // 周波数表示
  canvasCtx.font = "10px serif";
  canvasCtx.fillText(
    frequency ? `${frequency}Hz` : "Synthesis",
    constants.GRAPH_PADDING,
    constants.GRAPH_PADDING
  );

  let prePos = {
    x: constants.CANVAS_PADDING + constants.GRAPH_PADDING,
    y: centerHeight,
  };
  for (let i = 0; i < channelData.length; i = i + stepInterval) {
    const amp = channelData[i] * stepHeightHalf;

    const curPos = {
      x:
        constants.CANVAS_PADDING +
        constants.GRAPH_PADDING +
        stepWidth * (i / stepInterval),
      y: centerHeight - amp,
    };

    if (i === 0) {
      // 先頭は値を入れておくのみにする（0位置の設定のため）
      prePos = curPos;
      continue;
    }

    // 波形の描画
    canvasCtx.strokeStyle = "#48A7C7";
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();
    canvasCtx.moveTo(prePos.x, prePos.y);
    canvasCtx.lineTo(curPos.x, curPos.y);
    canvasCtx.stroke();
    prePos = curPos;
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export { getMaxValue, normalizeValue, drawWavePeriod };
