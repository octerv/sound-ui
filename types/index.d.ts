declare module "sound-ui/types" {
  export type Position = {
    x: number;
    y: number;
  };

  export type WavesProps = {
    dataUrl?: string;
    annotations?: Annotation[];
    width: number;
    height: number;
    samplingLevel?: number; // max: 0.001, 0.01, 0.1, 1.0など
    normalize?: boolean;
    clickable?: boolean;
    selectable?: boolean;
    mono?: boolean;
    scale?: number;
    currentTime?: number; // ミリ秒数位置指定
    setPlayPosition?: (seconds: number) => void;
  };

  export type Annotation = {
    startTime: number;
    endTime: number;
    label: string;
  };

  export interface CanvasPropsInterface {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    height: number;
  }
}
