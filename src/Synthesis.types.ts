interface SynthesisProps {
  width: number;
  height: number;
  audioContext: AudioContext | null;
  duration?: number; // 秒、デフォルトは1秒
  frequencies?: number[]; // 周波数を指定
  playing?: number;
}

export { SynthesisProps };
