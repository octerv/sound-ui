import { RefObject } from "react";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// local functions
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// SPLIT SCALE
// duration >= 1:00:00 ... each 10:00 = sampleRate * 600
// duration >= 30:00 && duration < 1:00:00 ... each 5:00 = sampleRate * 300
// duration >= 10:00 && duration < 30:00 ... each 3:00 = sampleRate * 180
// duration >= 1:00 && duration < 10:00 ... each 1:00 = sampleRate * 60
// duration < 1:00 ... each 0:05 = sampleRate * 5
function _scaling(
  audioBuffer: AudioBuffer,
  position: number = 0, // second
  scale: number = 1.0
): any {
  const center =
    position === 0
      ? 0
      : Math.floor(audioBuffer.length * (position / audioBuffer.duration));
  const dataLength = audioBuffer.length * scale;
  const options = {
    length: dataLength,
    numberOfChannels: audioBuffer.numberOfChannels,
    sampleRate: audioBuffer.sampleRate,
  };

  const buffer = new AudioBuffer(options);
  let start = 0;
  let end = audioBuffer.length;
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    let channelData = new Float32Array(audioBuffer.length);
    audioBuffer.copyFromChannel(channelData, i);
    // positionを中心にscale取得する
    if (0 < center - dataLength / 2 && center + dataLength / 2 < dataLength) {
      // 両橋がはみ出さない
      start = center - dataLength / 2;
      end = center + dataLength / 2;
    } else if (0 > center - dataLength / 2) {
      // 左端がはみ出す
      end = dataLength;
    } else if (center + dataLength / 2 > dataLength) {
      start = audioBuffer.length - dataLength;
    }
    let scaledChannelData = channelData.slice(start, end);
    buffer.copyToChannel(scaledChannelData, i);
  }

  // const buffer = audioBuffer;
  const duration = buffer.duration;

  // (default interval) = (duration >= 1:00:00)
  let interval = buffer.sampleRate * 600;
  if (duration >= 30 * 60 && duration < 60 * 60) {
    interval = buffer.sampleRate * 300;
  } else if (duration >= 10 * 60 && duration < 30 * 60) {
    interval = buffer.sampleRate * 180;
  } else if (duration >= 1 * 60 && duration < 10 * 60) {
    interval = buffer.sampleRate * 60;
  } else if (duration < 60) {
    interval = buffer.sampleRate * 5;
  }

  // 目盛りの計算
  const adjust = Math.floor(start / buffer.sampleRate);
  let scales: { [index: number]: number } = {};
  for (let i = 0; i < buffer.length; i = i + interval) {
    scales[i] = i / buffer.sampleRate + adjust;
  }

  return { buffer, scales, adjust };
}

function _getTimeStr(second: number): string {
  const hour = Math.floor(second / (60 * 60));
  const min = Math.floor((second % (60 * 60)) / 60);
  const sec = Math.floor(second % 60);
  return hour === 0
    ? `${("0" + min).slice(-2)}:${("0" + sec).slice(-2)}`
    : `${("0" + hour).slice(-2)}:${("0" + min).slice(-2)}:${("0" + sec).slice(
        -2
      )}`;
}

function _getMax(audioBuffer: AudioBuffer): { [index: number]: number } {
  // 最大値の取得
  let max: { [index: number]: number } = {};
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const value = audioBuffer.getChannelData(i).reduce((a, b) => {
      const aa: number = a < 0 ? -a : a;
      const bb: number = b < 0 ? -b : b;
      // console.debug(`${a} -> ${aa}, ${b} -> ${bb}`);
      return Math.max(aa, bb);
      // return Math.max(a, b);
    }, 0);
    max[i] = value;
  }
  return max;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export functions
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const sliceByNumber = (array: number[], number: number) => {
  const length = Math.ceil(array.length / number);
  return new Array(length)
    .fill(0)
    .map((_, i) => array.slice(i * number, (i + 1) * number));
};

const getCursorSecond = (
  canvasWavesWidth: number,
  adjustWidth: number,
  duration: number,
  x: number
) => {
  if (x === 0) return 0;
  return ((x - adjustWidth) * duration) / (canvasWavesWidth - adjustWidth * 2);
};

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

const drawWaves = (
  audioBuffer: AudioBuffer | null,
  canvasRef: RefObject<HTMLCanvasElement> | null,
  constants: { [key: string]: any },
  normalize: boolean,
  canvasWavesWidth: number,
  samplingLevel: number
) => {
  if (!audioBuffer) return;
  if (!canvasRef || !canvasRef.current) return;
  console.info("[info] drawing: waves");

  // canvasのサイズを変更してスケールを表現
  const { buffer, scales } = _scaling(audioBuffer);

  // どれくらいの詳細度で描画するか（以下は1/10秒）
  const stepInterval = buffer.sampleRate * samplingLevel;
  console.debug(`sampling level: ${samplingLevel}, interval: ${stepInterval}`);

  // canvasの取得
  const canvasWidth = canvasWavesWidth;
  const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);

  // graph frame size
  const graphWidth = canvasWidth - constants.CANVAS_PADDING * 2;
  const graphHeight =
    (canvasHeight -
      constants.CANVAS_PADDING * 3 -
      constants.VERTICAL_SCALE_HEIGHT) /
    2;

  // step size
  const stepWidth =
    (graphWidth - constants.GRAPH_PADDING * 2) /
    (buffer.getChannelData(0).length / stepInterval);
  const stepHeight = graphHeight - constants.GRAPH_PADDING * 2;

  // clear previous waves
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  // prepare normalize
  const max = _getMax(audioBuffer);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    let channelData = buffer.getChannelData(i);
    if (normalize && max[i]) {
      console.debug(`max[${i}]: ${max[i]}`);
      channelData = channelData.map((a: number) => {
        return a / max[i];
      });
    }
    const centerHeight =
      constants.CANVAS_PADDING * (i * 1) + graphHeight * i + graphHeight / 2;

    let prePos = {
      x: constants.CANVAS_PADDING + constants.GRAPH_PADDING,
      y: centerHeight,
    };
    for (let j = 0; j < channelData.length; j = j + stepInterval) {
      const amp = channelData[j] * (stepHeight / 2);

      const curPos = {
        x:
          constants.CANVAS_PADDING +
          constants.GRAPH_PADDING +
          stepWidth * (j / stepInterval),
        y: centerHeight - amp,
      };

      // draw horizontal scale
      if (j in scales) {
        // console.debug(`draw scale [${j}:${scales[j]}]`);
        const y = graphHeight * i + constants.CANVAS_PADDING * (i + 1);
        canvasCtx.strokeStyle = "#2F4147";
        canvasCtx.lineWidth = 0.2;
        canvasCtx.beginPath();
        canvasCtx.moveTo(curPos.x, y);
        canvasCtx.lineTo(curPos.x, y + graphHeight);
        canvasCtx.closePath();
        canvasCtx.stroke();
        // 初回のみ目盛り文字を描画
        if (i === 0) {
          const scaleY = canvasHeight - constants.VERTICAL_SCALE_HEIGHT + 8;
          canvasCtx.font = "10px serif";
          canvasCtx.fillText(_getTimeStr(scales[j]), curPos.x, scaleY);
        }
      }

      if (j === 0) {
        // 先頭は値を入れておくのみにする（0位置の設定のため）
        prePos = curPos;
        continue;
      }

      // 波形の描画
      canvasCtx.strokeStyle = "#48A7C7";
      canvasCtx.lineWidth = 0.5;
      canvasCtx.beginPath();
      canvasCtx.moveTo(prePos.x, prePos.y);
      canvasCtx.lineTo(curPos.x, curPos.y);
      canvasCtx.stroke();
      prePos = curPos;
    }
  }
};

const drawSelectedRanges = (
  canvasDecorationRef: RefObject<HTMLCanvasElement> | null,
  constants: { [key: string]: any },
  canvasWavesWidth: number,
  ranges: number[],
  position: { [key: string]: number },
  selecting: boolean,
  scale: number
) => {
  if (!canvasDecorationRef || !canvasDecorationRef.current) return;

  const canvasWidth = canvasWavesWidth;
  const { canvasCtx, canvasHeight } = getCanvasContext(canvasDecorationRef);

  // clear
  canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

  // 選択された範囲を描画する
  const scaledRanges = ranges.map((r: number) => {
    return Math.round(r * scale);
  });
  const rescaleRanges = sliceByNumber(scaledRanges, 2);
  canvasCtx.fillStyle = "#7A5D65";
  canvasCtx.globalAlpha = 0.3;
  canvasCtx.beginPath();
  for (const range of rescaleRanges) {
    if (range.length === 2) {
      canvasCtx.fillRect(
        range[0],
        constants.CANVAS_PADDING,
        range[1] - range[0],
        canvasHeight -
          constants.CANVAS_PADDING * 2 -
          constants.VERTICAL_SCALE_HEIGHT
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
          constants.CANVAS_PADDING,
          end - start,
          canvasHeight -
            constants.CANVAS_PADDING * 2 -
            constants.VERTICAL_SCALE_HEIGHT
        );
      }
    }
  }
  canvasCtx.closePath();
  canvasCtx.fill();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export {
  getCursorSecond,
  sliceByNumber,
  getCanvasContext,
  drawWaves,
  drawSelectedRanges,
};
