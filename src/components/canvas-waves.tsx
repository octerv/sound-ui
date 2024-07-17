import { startTransition } from "react";
import { useEffect } from "react";
import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useWavesCanvasSetup } from "../effects.canvas";
import { drawWaveStereo, drawWaves } from "../functions.canvas";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Interface
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
interface Props extends CanvasPropsInterface {
  samplingLevel: number | undefined;
  stereo: boolean | undefined;
  setScaling: (scaling: boolean) => void;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasWaves = ({
  canvasRef,
  height,
  samplingLevel,
  stereo,
  setScaling,
}: Props) => {
  const { audioBuffer, normalize } = useDataContext();
  const { canvasWidth } = useScaleContext();
  const { drawing, setDrawing, setDrawn } = useDrawContext();
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useWavesCanvasSetup(canvasRef);

  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    setDrawing(true);
  }, [audioBuffer]);

  useEffect(() => {
    if (!drawing) return;
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;
    // draw waves
    startTransition(() => {
      if (stereo) {
        drawWaveStereo(
          audioBuffer,
          canvasRef,
          normalize,
          canvasWidth,
          samplingLevel || 0.01
        );
      } else {
        drawWaves(
          audioBuffer,
          canvasRef,
          normalize,
          canvasWidth,
          samplingLevel || 0.01
        );
      }
      console.info("[success] drew");
      setScaling(false);
      setDrawing(false);
      setDrawn(true);
    });
  }, [drawing]);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasWaves;
