import { RefObject, useEffect, useState } from "react";
import { base64ToArrayBuffer } from "./functions.common";

/**
 * 指定されたdataUrlからAudioContextを生成し、そのインスタンスを返すカスタムフックです。
 * AudioContextはWebオーディオAPIの一部で、オーディオ処理モジュールの生成と操作を行うためのインターフェースを提供します。
 * このフックは、提供されたdataUrlが変更されるたびに新しいAudioContextを生成します。
 * dataUrlが空の場合、何も行わずに処理を終了します。
 *
 * @param {string} dataUrl - オーディオデータへのURL。このURLからAudioContextを生成します。
 * @returns {AudioContext | null} 生成されたAudioContextのインスタンス、またはdataUrlが空の場合はnull。
 *
 * useEffectフック内でAudioContextを生成し、useStateを用いてそのインスタンスを管理します。
 * これにより、コンポーネントのライフサイクルに応じたAudioContextの生成と破棄が可能になります。
 */
const useAudioContext = (dataUrl: string): AudioContext | null => {
  const [ctx, setCtx] = useState<AudioContext | null>(null);

  useEffect(() => {
    if (!dataUrl) return; // dataUrlが提供されていなければ終了
    const newCtx = new window.AudioContext();
    setCtx(newCtx);
  }, [dataUrl]);

  return ctx;
};

/**
 * 指定されたdataUrlからオーディオデータを読み込み、AudioContextを使用してAudioBufferを生成するカスタムフックです。
 * 生成されたAudioBufferはオーディオ処理や再生のために使用されます。このフックは、dataUrlとAudioContextが与えられた際に
 * AudioBufferの生成を試み、生成に成功した場合はそのAudioBufferを返します。
 * dataUrlまたはAudioContextが不十分な場合、またはデータの読み込みに失敗した場合は処理を終了します。
 *
 * @param {string} dataUrl - オーディオデータのBase64エンコードされたURL。
 * @param {AudioContext | null} context - オーディオ処理を行うためのAudioContext。
 * @returns {AudioBuffer | null} デコードされたオーディオデータを含むAudioBuffer、または処理が完了できなかった場合はnull。
 *
 * useEffectフック内で、まずデータURLとAudioContextの有効性を確認し、両方が有効である場合にのみ処理を進めます。
 * base64エンコードされたデータURLからArrayBufferを抽出し、それをAudioContextを使用してAudioBufferにデコードします。
 * 生成されたAudioBufferは、useStateを用いて状態として保持され、最終的に返されます。
 */
const useAudioBuffer = (
  dataUrl: string,
  context: AudioContext | null
): {
  buffer: AudioBuffer | null;
  numberOfChannels: number;
  sampleRate: number;
  duration: number;
} => {
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [numberOfChannels, setNumberOfChannels] = useState<number>(0);
  const [sampleRate, setSampleRate] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

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
      setNumberOfChannels(buffer.numberOfChannels);
      setSampleRate(buffer.sampleRate);
      setDuration(buffer.duration);
      console.info("[success] load sound data");
    })();
  }, [context]);

  return { buffer, numberOfChannels, sampleRate, duration };
};

/**
 * 指定されたHTMLAudioElementの参照を受け取り、再生中の現在の時間をリアルタイムで追跡するカスタムフックです。
 * 再生時間は `requestAnimationFrame` を使用してブラウザの描画フレームごとに更新されます。
 * これにより、オーディオ再生時の現在時間が非常に滑らかに更新され、UIに表示する際の遅延が最小限に抑えられます。
 *
 * @param {RefObject<HTMLAudioElement>} audioRef - オーディオ要素への参照。
 * @returns {number} 現在の再生時間（秒単位）。この値はコンポーネントの状態として保持され、
 *                   描画フレームごとに更新されます。
 *
 * フックは、audioRefが指すオーディオ要素の存在を確認した後、再生時間を更新する関数を定義します。
 * この関数は `requestAnimationFrame` によって連続的に呼び出され、オーディオのcurrentTimeを取得して
 * 状態を更新します。コンポーネントのアンマウント時には、`requestAnimationFrame` によって
 * スケジュールされたフレームの更新をキャンセルすることで、不要なリソース消費を防ぎます。
 */
const useAudioTime = (audioRef: RefObject<HTMLAudioElement>): number => {
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    const audio = audioRef.current;
    let animationFrameId: number;

    const update = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
        animationFrameId = requestAnimationFrame(update);
      }
    };

    update(); // 初回実行

    return () => {
      cancelAnimationFrame(animationFrameId); // クリーンアップ
    };
  }, [audioRef]);

  return currentTime;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export { useAudioContext, useAudioBuffer, useAudioTime };
