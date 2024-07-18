import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useCurrentTime } from "../effects.canvas";
import { useScaleContext } from "../contexts/scale";
import { useDataContext } from "../contexts/data";

interface Props extends CanvasPropsInterface {
  currentTime: number | undefined;
}

const CanvasTimeline = ({ canvasRef, height, currentTime }: Props) => {
  const { duration } = useDataContext();
  const { canvasWidth } = useScaleContext();
  useCurrentTime(canvasRef, duration, canvasWidth, currentTime);
  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasTimeline;
