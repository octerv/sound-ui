import React from "react";
import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import {
  useFrameCanvasSetup,
  useFrameCanvasStereoUpdate,
  useFrameCanvasUpdate,
} from "../effects.canvas";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";

interface Props extends CanvasPropsInterface {
  stereo: boolean | undefined;
}

const CanvasFrame = ({ canvasRef, height, stereo }: Props) => {
  const { audioBuffer } = useDataContext();
  const { canvasWidth } = useScaleContext();
  useFrameCanvasSetup(canvasRef);
  if (stereo) {
    useFrameCanvasStereoUpdate(canvasRef, audioBuffer);
  } else {
    useFrameCanvasUpdate(canvasRef, audioBuffer);
  }

  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasFrame;
