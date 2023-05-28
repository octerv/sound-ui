type FrequencyConfig = {
  frequency: number;
  volume: number;
};

interface SynthesisProps {
  width: number;
  height: number;
  audioContext: AudioContext | null;
  duration?: number; // 秒、デフォルトは1秒
  frequencies?: FrequencyConfig[]; // 周波数を指定
  playing?: number;
}

export { FrequencyConfig, SynthesisProps };
