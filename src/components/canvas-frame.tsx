import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useFrameCanvasSetup } from "../effects.canvas";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";

const CanvasFrame = ({ canvasRef, height }: CanvasPropsInterface) => {
  const { numberOfChannels, mono } = useDataContext();
  const { contentHeight, canvasWidth } = useScaleContext();
  const n = mono ? 1 : numberOfChannels;
  useFrameCanvasSetup(canvasRef, contentHeight, canvasWidth, n);
  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasFrame;
