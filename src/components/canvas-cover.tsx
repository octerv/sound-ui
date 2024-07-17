import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useCoverCanvasSetup } from "../effects.canvas";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";

interface Props extends CanvasPropsInterface {
  stereo: boolean | undefined;
}

const CanvasCover = ({ canvasRef, height, stereo }: Props) => {
  const { audioBuffer } = useDataContext();
  const { canvasWidth } = useScaleContext();
  useCoverCanvasSetup(canvasRef, audioBuffer, stereo);
  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasCover;
