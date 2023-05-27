//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Private
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

import { getMaxValue, normalizeValue } from "./function.wave";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Public
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const createAudioBuffer = (
  audioContext: AudioContext,
  duration: number,
  frequency: number
): AudioBuffer => {
  // 音声バッファのパラメーター
  const sampleRate = audioContext.sampleRate;

  // サンプル数とチャンネル数の計算
  const numSamples = Math.floor(duration * sampleRate);

  // 音声バッファの作成
  const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);

  // バッファへの書き込み
  const channelData = audioBuffer.getChannelData(0); // モノラルの場合、チャンネル0を使用

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate; // 時間（秒）の計算
    const value = Math.sin(2 * Math.PI * frequency * t); // 正弦波の値の計算

    // -1から1の範囲に正規化して格納
    channelData[i] = value;
  }

  return audioBuffer;
};

const synthesisWaves = (
  audioContext: AudioContext,
  buffers: AudioBuffer[]
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  let audioBuffer = audioContext.createBuffer(1, buffers[0].length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < buffers[0].length; i++) {
    let value = 0;
    for (let j = 0; j < buffers.length; j++) {
      const data = buffers[j].getChannelData(0);
      value += data[i];
    }
    channelData[i] = value;
  }
  const max = getMaxValue(audioBuffer);
  if (max > 1) {
    audioBuffer = normalizeValue(audioBuffer, max);
  }
  return audioBuffer;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export { createAudioBuffer, synthesisWaves };
