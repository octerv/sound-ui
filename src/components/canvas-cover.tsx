import { Content } from "./styled";
import { useCoverCanvasSetup } from "../effects.canvas";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";
import { useRef } from "react";

const CanvasCover = () => {
  const { numberOfChannels, mono } = useDataContext();
  const { contentHeight, canvasWidth } = useScaleContext();
  const n = mono ? 1 : numberOfChannels;

  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---------- Effects ----------
  useCoverCanvasSetup(canvasRef, n);

  // ---------- Render ----------
  return <Content width={canvasWidth} height={contentHeight} ref={canvasRef} />;
};

export default CanvasCover;
