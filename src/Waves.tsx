import { CSSProperties, useRef, useState } from "react";
import { Area } from "./components/styled";
import CanvasFrame from "./components/canvas-frame";
import CanvasWaves from "./components/canvas-waves";
import CanvasDecoration from "./components/canvas-decoration";
import CanvasCover from "./components/canvas-cover";
import CanvasMouse from "./components/canvas-mouse";
import CanvasTimeline from "./components/canvas-timeline";
import { WavesProps } from "sound-ui/types";
import { useCanvasClear } from "./effects.canvas";
import { ScaleProvider } from "./contexts/scale";
import { ActionProvider } from "./contexts/action";
import { DrawProvider } from "./contexts/draw";
import { DataProvider } from "./contexts/data";

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const Waves = (props: WavesProps) => {
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Ref
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasFrameRef = useRef<HTMLCanvasElement>(null);
  const canvasWavesRef = useRef<HTMLCanvasElement>(null);
  const canvasDecorationRef = useRef<HTMLCanvasElement>(null);
  const canvasMouseRef = useRef<HTMLCanvasElement>(null);
  const canvasTimelineRef = useRef<HTMLCanvasElement>(null);
  const canvasCoverRef = useRef<HTMLCanvasElement>(null);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // State
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const [scaling, setScaling] = useState(false);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  useCanvasClear(
    props.dataUrl,
    canvasFrameRef,
    canvasWavesRef,
    canvasDecorationRef
  );

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const styles: { [key: string]: CSSProperties } = {
    area: {
      width: props.width,
      height: props.height,
      overflowX: "auto",
      overflowY: "hidden",
    },
  };
  return (
    <Area ref={areaRef} style={styles.area}>
      <DataProvider dataUrl={props.dataUrl} mono={props.mono}>
        <ScaleProvider contentWidth={props.width} contentHeight={props.height}>
          <DrawProvider>
            <ActionProvider>
              <CanvasFrame canvasRef={canvasFrameRef} height={props.height} />
              <CanvasWaves
                canvasRef={canvasWavesRef}
                height={props.height}
                samplingLevel={props.samplingLevel}
                setScaling={setScaling}
              />
              <CanvasDecoration
                canvasRef={canvasDecorationRef}
                height={props.height}
              />
              <CanvasTimeline
                canvasRef={canvasTimelineRef}
                height={props.height}
                currentTime={props.currentTime}
              />
              <CanvasCover canvasRef={canvasCoverRef} height={props.height} />
              <CanvasMouse
                canvasRef={canvasMouseRef}
                areaRef={areaRef}
                selectable={props.selectable}
                height={props.height}
                scaling={scaling}
                initNormalize={props.normalize}
                setScaling={setScaling}
              />
            </ActionProvider>
          </DrawProvider>
        </ScaleProvider>
      </DataProvider>
    </Area>
  );
};

export default Waves;
