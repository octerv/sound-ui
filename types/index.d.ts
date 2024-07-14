declare module "sound-ui/types" {
  export type Position = {
    x: number;
    y: number;
  };

  export type WavesProps = {
    dataUrl: string;
    width: number;
    height: number;
    samplingLevel?: number; // max: 0.001, 0.01, 0.1, 1.0など
    normalize?: boolean;
    selectable?: boolean;
    stereo?: boolean;
    currentTime?: number; // ミリ秒数位置指定
    maxAreaLength?: number; // 秒指定
    setMaxArea?: (area: number[]) => void;
  };

  export interface CanvasPropsInterface {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    width: number;
    height: number;
    audioBuffer: AudioBuffer | null;
  }
}
