// SPLIT SCALE
// duration >= 1:00:00 ... each 10:00 = sampleRate * 600
// duration >= 30:00 && duration < 1:00:00 ... each 5:00 = sampleRate * 300
// duration >= 10:00 && duration < 30:00 ... each 3:00 = sampleRate * 180
// duration >= 1:00 && duration < 10:00 ... each 1:00 = sampleRate * 60
// duration < 1:00 ... each 0:05 = sampleRate * 5
/**
 * スケールを変更する
 * @param audioBuffer
 * @param position
 * @param scale
 * @returns
 */
function scaling(
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

/**
 * 配列を指定された個数で分割する
 * @param array
 * @param number
 * @returns
 */
const sliceByNumber = (array: number[], number: number) => {
  const length = Math.ceil(array.length / number);
  return new Array(length)
    .fill(0)
    .map((_, i) => array.slice(i * number, (i + 1) * number));
};

/**
 * Base64エンコードされた文字列をArrayBufferに変換する関数です。
 * この関数は、Base64の文字列からデータ部分のみを抽出し、それをバイナリ形式の配列にデコードして、
 * 最終的にそのバイナリデータを格納したArrayBufferを返します。
 *
 * @param {string} base64 - Base64でエンコードされたデータを含む文字列。
 *                          通常は"data:image/png;base64,..."のような形式です。
 * @returns {ArrayBufferLike | null} - デコードされたデータを含むArrayBuffer、
 *                                     もしくは入力が無効な場合はnullを返します。
 *
 * 入力された文字列から、Base64エンコーディングのヘッダー部分（例："data:image/png;base64,"）を除去し、
 * 残りの文字列をデコードします。デコードされたバイナリデータはUint8Arrayに変換され、
 * そのバッファを返します。この過程で、無効なBase64文字列が与えられた場合はnullを返します。
 */
const base64ToArrayBuffer = (base64: string): ArrayBufferLike | null => {
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
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export { scaling, sliceByNumber, base64ToArrayBuffer };
