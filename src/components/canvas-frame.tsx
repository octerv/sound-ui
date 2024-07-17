import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useFrameCanvasSetup } from "../effects.canvas";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";

interface Props extends CanvasPropsInterface {
  stereo: boolean | undefined;
}

const CanvasFrame = ({ canvasRef, height, stereo }: Props) => {
  const { audioBuffer, numberOfChannels } = useDataContext();
  const { contentWidth, contentHeight, canvasWidth } = useScaleContext();
  useFrameCanvasSetup(canvasRef, contentHeight, canvasWidth, numberOfChannels);
  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasFrame;
