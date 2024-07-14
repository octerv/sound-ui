import { useEffect, useState } from "react";

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

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export { useAudioContext, useAudioBuffer };
