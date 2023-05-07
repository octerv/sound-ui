import React from "react";
import { Content } from "./styled";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
  left: number;
}

const CanvasDecoration = ({ canvasRef, width, height, left }: Props) => {
  const wavesStyle = { left };
  return (
    <Content width={width} height={height} style={wavesStyle} ref={canvasRef} />
  );
};

export default CanvasDecoration;
