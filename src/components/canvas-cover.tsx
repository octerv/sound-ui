import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useCoverCanvasSetup } from "../effects.canvas";
import { useDataContext } from "../contexts/data";

interface Props extends CanvasPropsInterface {
  stereo: boolean | undefined;
}

const CanvasCover = ({ canvasRef, width, height, stereo }: Props) => {
  const { audioBuffer } = useDataContext();
  useCoverCanvasSetup(canvasRef, audioBuffer, stereo);
  return <Content width={width} height={height} ref={canvasRef} />;
};

export default CanvasCover;
