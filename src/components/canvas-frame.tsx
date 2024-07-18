import { Content } from "./styled";
import { useFrameCanvasSetup } from "../effects.canvas";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";
import { useRef } from "react";

const CanvasFrame = () => {
  const { audioBuffer, numberOfChannels, mono } = useDataContext();
  const { contentHeight, canvasWidth } = useScaleContext();
  const n = mono ? 1 : numberOfChannels;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useFrameCanvasSetup(canvasRef, contentHeight, canvasWidth, audioBuffer, n);
  return <Content width={canvasWidth} height={contentHeight} ref={canvasRef} />;
};

export default CanvasFrame;
