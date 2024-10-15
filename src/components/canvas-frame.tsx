import { Content } from "./styled";
import { useFrameCanvasSetup } from "../effects.canvas";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";
import { useRef } from "react";

const CanvasFrame = () => {
  const { audioBuffer, numberOfChannels, mono } = useDataContext();
  const { contentWidth, contentHeight } = useScaleContext();
  const n = mono ? 1 : numberOfChannels;

  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---------- Effects ----------
  useFrameCanvasSetup(canvasRef, contentWidth, contentHeight, audioBuffer, n);

  // ---------- Render ----------
  return (
    <Content width={contentWidth} height={contentHeight} ref={canvasRef} />
  );
};

export default CanvasFrame;
