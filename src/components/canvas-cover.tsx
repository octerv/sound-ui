import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useCoverCanvasSetup } from "../effects.canvas";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";

const CanvasCover = ({ canvasRef, height }: CanvasPropsInterface) => {
  const { numberOfChannels, mono } = useDataContext();
  const { canvasWidth } = useScaleContext();
  const n = mono ? 1 : numberOfChannels;
  useCoverCanvasSetup(canvasRef, n);
  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasCover;
