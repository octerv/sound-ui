import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useCurrentTime } from "../effects.canvas";
import { useScaleContext } from "../contexts/scale";
import { useDataContext } from "../contexts/data";

interface Props extends CanvasPropsInterface {
  currentTime: number | undefined;
}

const CanvasTimeline = ({ canvasRef, width, height, currentTime }: Props) => {
  const { audioBuffer } = useDataContext();
  const { canvasWavesLeft } = useScaleContext();
  useCurrentTime(canvasRef, audioBuffer, width, currentTime);
  const wavesStyle = { left: canvasWavesLeft };
  return (
    <Content width={width} height={height} style={wavesStyle} ref={canvasRef} />
  );
};

export default CanvasTimeline;
