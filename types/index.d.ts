declare module "sound-ui/types" {
  export type Position = {
    x: number;
    y: number;
  };

  export type WavesProps = {
    dataUrl?: string;
    annotations?: Annotation[];
    classes?: string[];
    confThreshold?: number;
    width: number;
    height: number;
    samplingLevel?: number; // max: 0.001, 0.01, 0.1, 1.0など
    normalize?: boolean;
    clickable?: boolean;
    selectable?: boolean;
    mono?: boolean;
    scale?: number;
    setZoomLevel?: (zoomLevel: number) => void;
    currentTime?: number; // ミリ秒数位置指定
    setPlayPosition?: (seconds: number) => void;
    setUpdateStatus?: (status: string) => void;
  };

  export type Annotation = {
    startTime: number;
    endTime: number;
    label: string;
    confidence: number;
  };

  export interface CanvasPropsInterface {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    height: number;
  }
}
