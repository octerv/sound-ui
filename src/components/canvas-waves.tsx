import { startTransition } from "react";
import { useEffect } from "react";
import { Content } from "./styled";
import { CanvasPropsInterface } from "sound-ui/types";
import { useWavesCanvasSetup } from "../effects.canvas";
import {
  drawWaveStereo,
  drawWaves,
  drawWavesStereoToMono,
} from "../functions.canvas";
import { useDrawContext } from "../contexts/draw";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Interface
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
interface Props extends CanvasPropsInterface {
  samplingLevel: number | undefined;
  setScaling: (scaling: boolean) => void;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const CanvasWaves = ({
  canvasRef,
  height,
  samplingLevel,
  setScaling,
}: Props) => {
  const { audioBuffer, numberOfChannels, mono } = useDataContext();
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
    if (!audioBuffer) return;
    if (!canvasRef || !canvasRef.current) return;

    // draw waves
    startTransition(() => {
      if (numberOfChannels === 1) {
        drawWaves(audioBuffer, canvasRef, canvasWidth, samplingLevel || 0.01);
      } else if (mono && numberOfChannels === 2) {
        drawWavesStereoToMono(
          audioBuffer,
          canvasRef,
          canvasWidth,
          samplingLevel || 0.01
        );
      } else if (numberOfChannels === 2) {
        drawWaveStereo(
          audioBuffer,
          canvasRef,
          canvasWidth,
          samplingLevel || 0.01
        );
      }
      console.info("[success] drew");
      setScaling(false);
      setDrawing(false);
      setDrawn(true);
    });
  }, [audioBuffer, numberOfChannels, canvasWidth, mono]);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  return <Content width={canvasWidth} height={height} ref={canvasRef} />;
};

export default CanvasWaves;
