import React from "react";
import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useCurrentTime } from "../effects.canvas";

interface Props extends CanvasPropsInterface {
  left: number;
  currentTime: number | undefined;
}

const CanvasTimeline = ({
  canvasRef,
  width,
  height,
  audioBuffer,
  left,
  currentTime,
}: Props) => {
  useCurrentTime(canvasRef, audioBuffer, width, currentTime);
  const wavesStyle = { left };
  return (
    <Content width={width} height={height} style={wavesStyle} ref={canvasRef} />
  );
};

export default CanvasTimeline;
