import { Content } from "./styled";
import { useCurrentTime } from "../effects.canvas";
import { useScaleContext } from "../contexts/scale";
import { useDataContext } from "../contexts/data";
import { useRef } from "react";

interface Props {
  areaRef: React.RefObject<HTMLDivElement>;
  currentTime: number | undefined;
}

const CanvasTimeline = ({ areaRef, currentTime }: Props) => {
  const { duration } = useDataContext();
  const { contentHeight, canvasWidth } = useScaleContext();

  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ---------- Events ----------
  useCurrentTime(canvasRef, areaRef, duration, canvasWidth, currentTime);

  // ---------- Render ----------
  return <Content width={canvasWidth} height={contentHeight} ref={canvasRef} />;
};

export default CanvasTimeline;
