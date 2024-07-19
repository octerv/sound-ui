import { startTransition, useRef } from "react";
import { useEffect } from "react";
import { Content } from "./styled";
import { drawWavePeriod, getCanvasContext } from "../functions.canvas";
import { CanvasPropsInterface } from "sound-ui/types";
import { useWavesCanvasSetup } from "../effects.canvas";
import { useScaleContext } from "../contexts/scale";

interface Props extends CanvasPropsInterface {
  audioBuffer: AudioBuffer;
  top: number;
  left: number;
  period: number;
  frequency?: number;
}

const CanvasWavePeriod = ({
  audioBuffer,
  top,
  left,
  height,
  period,
  frequency,
}: Props) => {
  const { canvasWidth } = useScaleContext();

  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---------- Effects ----------
  useWavesCanvasSetup(canvasRef, "");

  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    const { canvasCtx, canvasWidth, canvasHeight } =
      getCanvasContext(canvasRef);
    // clear
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    // draw waves
    startTransition(() => {
      drawWavePeriod(audioBuffer, canvasRef, period, frequency);
      console.info("[info] success drew");
    });
  }, [canvasRef]);

  // ---------- Render ----------
  const wavesStyle = { top, left };
  return (
    <Content
      width={canvasWidth}
      height={height}
      style={wavesStyle}
      ref={canvasRef}
    />
  );
};

export default CanvasWavePeriod;
