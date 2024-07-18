import { Content } from "./styled";
import { useCoverCanvasSetup } from "../effects.canvas";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";
import { useRef } from "react";

const CanvasCover = () => {
  const { numberOfChannels, mono } = useDataContext();
  const { contentHeight, canvasWidth } = useScaleContext();
  const n = mono ? 1 : numberOfChannels;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useCoverCanvasSetup(canvasRef, n);

  return <Content width={canvasWidth} height={contentHeight} ref={canvasRef} />;
};

export default CanvasCover;
