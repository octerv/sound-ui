import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useCoverCanvasSetup } from "../effects.canvas";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";

const CanvasCover = ({ canvasRef, height }: CanvasPropsInterface) => {
  const { numberOfChannels } = useDataContext();
  const { canvasWidth } = useScaleContext();
  useCoverCanvasSetup(canvasRef, numberOfChannels);
  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasCover;
