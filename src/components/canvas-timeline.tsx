import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useCurrentTime } from "../effects.canvas";
import { useScaleContext } from "../contexts/scale";
import { useDataContext } from "../contexts/data";

interface Props extends CanvasPropsInterface {
  areaRef: React.RefObject<HTMLDivElement>;
  currentTime: number | undefined;
}

const CanvasTimeline = ({ canvasRef, height, areaRef, currentTime }: Props) => {
  const { duration } = useDataContext();
  const { contentWidth, canvasWidth } = useScaleContext();
  useCurrentTime(canvasRef, areaRef, duration, canvasWidth, currentTime);
  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasTimeline;
