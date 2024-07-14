import React from "react";
import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import {
  useFrameCanvasSetup,
  useFrameCanvasStereoUpdate,
  useFrameCanvasUpdate,
} from "../effects.canvas";

interface Props extends CanvasPropsInterface {
  stereo: boolean | undefined;
}

const CanvasFrame = ({
  canvasRef,
  width,
  height,
  audioBuffer,
  stereo,
}: Props) => {
  useFrameCanvasSetup(canvasRef);
  if (stereo) {
    useFrameCanvasStereoUpdate(canvasRef, audioBuffer);
  } else {
    useFrameCanvasUpdate(canvasRef, audioBuffer);
  }

  return <Content width={width} height={height} ref={canvasRef} />;
};

export default CanvasFrame;
