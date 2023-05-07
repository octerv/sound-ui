type Position = {
  x: number;
  y: number;
};

type WavesProps = {
  dataUrl: string;
  width: number;
  height: number;
  samplingLevel?: number; // max: 0.001, 0.01, 0.1, 1.0など
  normalize?: boolean;
  selectable?: boolean;
};

export { Position, WavesProps };