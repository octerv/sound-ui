import { useEffect, useState } from "react";
import { base64ToArrayBuffer } from "./functions.common";

const useAudioContext = (dataUrl: string): AudioContext | null => {
  const [ctx, setCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (!dataUrl) return; // dataUrlが提供されていなければ終了
    const newCtx = new window.AudioContext();
    setCtx(newCtx);
  }, [dataUrl]);

  return ctx;
};

const useAudioBuffer = (
  dataUrl: string,
  context: AudioContext | null
): AudioBuffer | null => {
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
    const buf = base64ToArrayBuffer(dataUrl);

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

const useAudioMeta = (
  audioBuffer: AudioBuffer | null
): { numberOfChannels: number; sampleRate: number; duration: number } => {
  const [numberOfChannels, setNumberOfChannels] = useState<number>(0);
  const [sampleRate, setSampleRate] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  useEffect(() => {
    if (!audioBuffer) return;
    setNumberOfChannels(audioBuffer.numberOfChannels);
    setSampleRate(audioBuffer.sampleRate);
    setDuration(audioBuffer.duration);
  }, [audioBuffer]);
  return { numberOfChannels, sampleRate, duration };
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export { useAudioContext, useAudioBuffer, useAudioMeta };
