import React from "react";
import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useCoverCanvasSetup } from "../effects.canvas";

interface Props extends CanvasPropsInterface {
  stereo: boolean | undefined;
}

const CanvasCover = ({
  canvasRef,
  width,
  height,
  audioBuffer,
  stereo,
}: Props) => {
  useCoverCanvasSetup(canvasRef, audioBuffer, stereo);
  return <Content width={width} height={height} ref={canvasRef} />;
};

export default CanvasCover;
