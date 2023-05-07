import { RefObject, useEffect, useState } from "react";
import {
  getCanvasContext,
  getCurrentTimePosition,
  getCursorSecond,
  sliceByNumber,
} from "./Waves.functions";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// local functions
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
function _base64ToArrayBuffer(base64: string): ArrayBufferLike | null {
  const idx = base64.indexOf(",");
  if (idx <= 0) return null;

  // "data:audio/mpeg;base64," を空文字に置換する（削除する）
  console.info(`[info]: ${base64.substring(0, idx)}`);
  const target = base64.substring(idx + 1);
  const binary_string = window.atob(target);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

const _getTimeStr = (second: number) => {
  const hour = Math.floor(second / (60 * 60));
  const min = Math.floor((second % (60 * 60)) / 60);
  const sec = Math.floor(second % 60);
  return hour === 0
    ? `${("0" + min).slice(-2)}:${("0" + sec).slice(-2)}`
    : `${("0" + hour).slice(-2)}:${("0" + min).slice(-2)}:${("0" + sec).slice(
        -2
      )}`;
};

const _clearCanvas = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  constants: { [key: string]: any }
) => {
  // clear canvas
  if (!canvasRef || !canvasRef.current) return;
  let { canvasCtx, canvasWidth, canvasHeight } = getCanvasContext(canvasRef);
  canvasCtx.clearRect(
    constants.CANVAS_PADDING,
    constants.CANVAS_PADDING,
    canvasWidth - constants.CANVAS_PADDING * 2,
    canvasHeight - constants.CANVAS_PADDING * 2
  );
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// effect functions
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const useAudioContext = (dataUrl: string) => {
  const [ctx, setCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (!dataUrl) return; // dataUrlが提供されていなければ終了
    const newCtx = new window.AudioContext();
    setCtx(newCtx);
  }, [dataUrl]);

  return ctx;
};

const useAudioBuffer = (dataUrl: string, context: AudioContext | null) => {
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    if (!dataUrl) return;
    if (!context) return;

    // init
    const analyser = context.createAnalyser();
    const source = context.createBufferSource();
    // connect
    source.connect(analyser);
    analyser.connect(context.destination);

    // base64 to arrayBuffer
    const buf = _base64ToArrayBuffer(dataUrl);

    if (!buf) {
      console.error("[error] load sound data");
      return;
    }

    (async () => {
      const buffer = await context.decodeAudioData(buf);
      console.debug(`channel count: ${buffer.numberOfChannels}`);
      console.debug(`sample rate: ${buffer.sampleRate}`);
      console.debug(`duration: ${buffer.duration}`);
      source.buffer = buffer;
      setBuffer(buffer);
      console.info("[success] load sound data");
    })();
  }, [context]);

  return buffer;
};

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
    canvasCtx.fillStyle = "#51707A";
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
  constants: { [key: string]: any },
  audioBuffer: AudioBuffer | null,
  stereo: boolean | undefined
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    const { canvasCtx, canvasWidth, canvasHeight } =
      getCanvasContext(canvasRef);
    canvasCtx.fillStyle = "#ffffff";
    canvasCtx.beginPath();
    canvasCtx.rect(1, 1, constants.CANVAS_PADDING - 2, canvasHeight - 2);
    canvasCtx.rect(
      canvasWidth - (constants.CANVAS_PADDING - 1),
      1,
      constants.CANVAS_PADDING - 2,
      canvasHeight - 2
    );
    canvasCtx.closePath();
    canvasCtx.fill();

    if (stereo) return;

    const graphHeight =
      (canvasHeight -
        constants.CANVAS_PADDING * 3 -
        constants.VERTICAL_SCALE_HEIGHT) /
      2;
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      // channel text
      canvasCtx.fillStyle = "#2F4147";
      canvasCtx.font = "12px serif";
      canvasCtx.fillText(
        `channel ${i + 1}`,
        constants.CANVAS_PADDING + 16,
        graphHeight * i + constants.CANVAS_PADDING * (i + 1) + 16
      );
    }
  }, [audioBuffer]);
};

const useFrameCanvasUpdate = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  constants: { [key: string]: any },
  audioBuffer: AudioBuffer | null
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;

    const { canvasCtx, canvasWidth, canvasHeight } =
      getCanvasContext(canvasRef);
    const graphWidth = canvasWidth - constants.CANVAS_PADDING * 2;
    const graphHeight =
      (canvasHeight -
        constants.CANVAS_PADDING * 3 -
        constants.VERTICAL_SCALE_HEIGHT) /
      2;
    console.debug(
      `canvas: ${canvasWidth}x${canvasHeight}, graph: ${graphWidth}x${graphHeight}`
    );

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const centerHeight =
        constants.CANVAS_PADDING * (i * 1) + graphHeight * i + graphHeight / 2;

      // draw frame
      canvasCtx.strokeStyle = "#347991";
      canvasCtx.lineWidth = 1;
      canvasCtx.beginPath();
      canvasCtx.rect(
        constants.CANVAS_PADDING,
        graphHeight * i + constants.CANVAS_PADDING * (i + 1),
        graphWidth,
        graphHeight
      );
      canvasCtx.closePath();
      canvasCtx.stroke();

      // draw grid (horizontal)
      canvasCtx.strokeStyle = "#2F4147";
      canvasCtx.lineWidth = 0.2;
      canvasCtx.beginPath();
      canvasCtx.moveTo(constants.CANVAS_PADDING, centerHeight);
      canvasCtx.lineTo(constants.CANVAS_PADDING + graphWidth, centerHeight);
      canvasCtx.closePath();
      canvasCtx.stroke();
    }
  }, [audioBuffer]);
};

const useFrameCanvasStereoUpdate = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  constants: { [key: string]: any },
  audioBuffer: AudioBuffer | null
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;

    const { canvasCtx, canvasWidth, canvasHeight } =
      getCanvasContext(canvasRef);
    const graphWidth = canvasWidth - constants.CANVAS_PADDING * 2;
    const graphHeight =
      canvasHeight -
      constants.CANVAS_PADDING * 2 -
      constants.VERTICAL_SCALE_HEIGHT;
    console.debug(
      `canvas: ${canvasWidth}x${canvasHeight}, graph: ${graphWidth}x${graphHeight}`
    );

    const centerHeight = constants.CANVAS_PADDING + graphHeight / 2;

    // draw frame
    canvasCtx.strokeStyle = "#347991";
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();
    canvasCtx.rect(
      constants.CANVAS_PADDING,
      constants.CANVAS_PADDING,
      graphWidth,
      graphHeight
    );
    canvasCtx.closePath();
    canvasCtx.stroke();

    // draw grid (horizontal)
    canvasCtx.strokeStyle = "#2F4147";
    canvasCtx.lineWidth = 0.2;
    canvasCtx.beginPath();
    canvasCtx.moveTo(constants.CANVAS_PADDING, centerHeight);
    canvasCtx.lineTo(constants.CANVAS_PADDING + graphWidth, centerHeight);
    canvasCtx.closePath();
    canvasCtx.stroke();
  }, [audioBuffer]);
};

/**
 * Canvasの描画をクリアする
 * @param dataUrl
 * @param constants
 * @param canvasFrameRef
 * @param canvasWavesRef
 * @param canvasDecorationRef
 */
const useCanvasClear = (
  dataUrl: string,
  constants: { [key: string]: any },
  canvasFrameRef: RefObject<HTMLCanvasElement> | null,
  canvasWavesRef: RefObject<HTMLCanvasElement> | null,
  canvasDecorationRef: RefObject<HTMLCanvasElement> | null
) => {
  useEffect(() => {
    if (!dataUrl) return; // dataUrlが提供されていなければ終了

    // clear canvas
    if (!canvasFrameRef || !canvasFrameRef.current) return;
    _clearCanvas(canvasFrameRef, constants);
    _clearCanvas(canvasWavesRef, constants);
    _clearCanvas(canvasDecorationRef, constants);
  }, [dataUrl]);
};

const useScaleEffect = (
  scale: number,
  position: { [key: string]: number },
  props: { [key: string]: any },
  canvasWavesLeft: number,
  canvasWavesWidth: number,
  setCanvasWavesLeft: (value: number) => void,
  setCanvasWavesWidth: (value: number) => void
) => {
  useEffect(() => {
    const updateWidth = Math.floor(props.width * scale);
    let newLeft = canvasWavesLeft;
    const leftSide = position.x - canvasWavesLeft;
    const leftSideRatio = leftSide / canvasWavesWidth;
    const newPos = Math.floor(updateWidth * leftSideRatio);
    newLeft = position.x - newPos;

    if (props.width - updateWidth > newLeft) {
      newLeft = props.width - updateWidth;
    }
    if (newLeft > 0) {
      newLeft = 0;
    }

    setCanvasWavesLeft(newLeft);
    setCanvasWavesWidth(updateWidth);
  }, [scale]);
};

/**
 * マウスの動きによる副作用
 * @param position
 * @param constants
 * @param audioBuffer
 * @param canvasRef
 * @param drewWaves
 * @param canvasWavesLeft
 * @param canvasWavesWidth
 * @param scale
 */
const useCursorEffect = (
  position: { [key: string]: number },
  constants: { [key: string]: any },
  audioBuffer: AudioBuffer | null,
  canvasRef: RefObject<HTMLCanvasElement> | null,
  drewWaves: boolean,
  canvasWavesLeft: number,
  canvasWavesWidth: number,
  scale: number
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!drewWaves) return;
    if (!canvasRef || !canvasRef.current) return;

    const { canvasCtx, canvasWidth, canvasHeight } =
      getCanvasContext(canvasRef);
    const frameWidth = canvasWidth / scale;

    // clear
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    // グラフの範囲外に出たら消したままにする
    if (
      position.x <
        constants.CANVAS_PADDING + constants.GRAPH_PADDING - canvasWavesLeft ||
      position.x >
        frameWidth -
          (constants.CANVAS_PADDING + constants.GRAPH_PADDING) -
          canvasWavesLeft ||
      position.y < constants.CANVAS_PADDING ||
      position.y > canvasHeight - constants.VERTICAL_SCALE_HEIGHT
    )
      return;

    // draw
    canvasCtx.strokeStyle = "#2F4147";
    canvasCtx.fillStyle = "#2F4147";
    canvasCtx.globalAlpha = 0.8;
    canvasCtx.beginPath();
    canvasCtx.moveTo(position.x, constants.CANVAS_PADDING);
    canvasCtx.lineTo(
      position.x,
      canvasHeight - constants.CANVAS_PADDING - constants.VERTICAL_SCALE_HEIGHT
    );
    canvasCtx.closePath();
    canvasCtx.stroke();

    // カーソル位置のTime表示
    const sec = getCursorSecond(
      canvasWavesWidth,
      constants.CANVAS_PADDING + constants.GRAPH_PADDING,
      audioBuffer.duration,
      position.x
    );
    canvasCtx.fillText(
      _getTimeStr(sec),
      position.x + 8,
      canvasHeight - constants.VERTICAL_SCALE_HEIGHT - 16
    );
  }, [position]);
};

/**
 * マウスで範囲選択された箇所を配列にする
 * @param selecting
 * @param position
 * @param scale
 * @param canvasWavesLeft
 * @param drewWaves
 * @param constants
 * @param canvasRef
 * @returns
 */
const useSelectedRanges = (
  selecting: boolean,
  position: { [key: string]: number },
  scale: number,
  canvasWavesLeft: number,
  drewWaves: boolean,
  constants: { [key: string]: any },
  canvasRef: RefObject<HTMLCanvasElement> | null
): number[] => {
  const [selectedRanges, setSelectedRanges] = useState<number[]>([]);

  useEffect(() => {
    if (!drewWaves) return;
    if (!canvasRef || !canvasRef.current) return;
    // グラフの範囲外に出たら消したままにする
    const { canvasWidth, canvasHeight } = getCanvasContext(canvasRef);
    const frameWidth = canvasWidth / scale;
    const unscaledPosX = Math.round(position.x / scale);

    const outOfCanvas =
      position.x <
        constants.CANVAS_PADDING + constants.GRAPH_PADDING - canvasWavesLeft ||
      position.x >
        frameWidth -
          (constants.CANVAS_PADDING + constants.GRAPH_PADDING) -
          canvasWavesLeft ||
      position.y < constants.CANVAS_PADDING ||
      position.y > canvasHeight - constants.VERTICAL_SCALE_HEIGHT;

    const cloneRanges = JSON.parse(JSON.stringify(selectedRanges));
    const rescaleRanges = sliceByNumber(cloneRanges, 2);
    let isInRanges = false;
    for (const check of rescaleRanges) {
      if (check.length === 2) {
        if (check[0] <= position.x && position.x <= check[1]) {
          isInRanges = true;
        }
      }
    }

    if (selecting) {
      // 選択開始
      if (outOfCanvas) return;
      if (isInRanges) return;
      if (cloneRanges.length % 2 === 0) {
        // 範囲選択が偶数の場合は開始位置を追加する
        cloneRanges.push(unscaledPosX);
      } else {
        cloneRanges.pop();
        cloneRanges.push(unscaledPosX);
      }
    } else {
      // 選択終了
      if (outOfCanvas) {
        cloneRanges.push(canvasWidth - constants.CANVAS_PADDING);
      } else if (cloneRanges.slice(-1)[0] === unscaledPosX) {
        // 同じ位置でMouseUpされた場合は選択とみなさない
        cloneRanges.pop();
      } else if (cloneRanges.length % 2 !== 0) {
        // 範囲選択が奇数の場合には終了位置を追加する
        const prePos = cloneRanges.pop() || 0;
        let start = prePos;
        let end = unscaledPosX;
        for (const check of rescaleRanges) {
          if (check.length === 2) {
            if (check[1] < prePos && unscaledPosX <= check[1]) {
              start = check[1] + 2;
              end = prePos;
            }
            if (prePos < check[0] && check[0] <= unscaledPosX) {
              end = check[0] - 2;
            }
          }
        }
        cloneRanges.push(start);
        cloneRanges.push(end);
      }
    }
    setSelectedRanges(cloneRanges);
  }, [selecting]);

  return selectedRanges;
};

/**
 * 指定された現在時刻のバーを描画する
 * @param canvasRef
 * @param constants
 * @param audioBuffer
 * @param canvasWavesWidth
 * @param currentTime
 */
const useCurrentTime = (
  canvasRef: RefObject<HTMLCanvasElement> | null,
  constants: { [key: string]: any },
  audioBuffer: AudioBuffer | null,
  canvasWavesWidth: number,
  currentTime: number | undefined
) => {
  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    if (!currentTime) return;
    _clearCanvas(canvasRef, constants);

    const { canvasCtx, canvasHeight } = getCanvasContext(canvasRef);
    const graphHeight =
      canvasHeight -
      constants.CANVAS_PADDING * 2 -
      constants.VERTICAL_SCALE_HEIGHT;
    const { x, y } = getCurrentTimePosition(
      constants,
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

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export {
  useAudioContext,
  useAudioBuffer,
  useFrameCanvasSetup,
  useWavesCanvasSetup,
  useMouseCanvasSetup,
  useCoverCanvasSetup,
  useFrameCanvasUpdate,
  useFrameCanvasStereoUpdate,
  useCanvasClear,
  useScaleEffect,
  useCursorEffect,
  useSelectedRanges,
  useCurrentTime,
};
