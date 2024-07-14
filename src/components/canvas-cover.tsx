import React from "react";
import { Content } from "./styled";
import { useCoverCanvasSetup } from "../Waves.effects";
import { CanvasPropsInterface } from "sound-ui/types";

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
