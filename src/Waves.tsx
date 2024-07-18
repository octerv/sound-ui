import { CSSProperties, useRef } from "react";
import { Area } from "./components/styled";
import CanvasFrame from "./components/canvas-frame";
import CanvasWaves from "./components/canvas-waves";
import CanvasDecoration from "./components/canvas-decoration";
import CanvasCover from "./components/canvas-cover";
import CanvasMouse from "./components/canvas-mouse";
import CanvasTimeline from "./components/canvas-timeline";
import { WavesProps } from "sound-ui/types";
import { ScaleProvider } from "./contexts/scale";
import { ActionProvider } from "./contexts/action";
import { DrawProvider } from "./contexts/draw";
import { DataProvider } from "./contexts/data";

const Waves = (props: WavesProps) => {
  // ---------- Refs ----------
  const areaRef = useRef<HTMLDivElement>(null);

  // ---------- Render ----------
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
      <DataProvider
        dataUrl={props.dataUrl}
        inputAnnotations={props.annotations}
        mono={props.mono}
      >
        <ScaleProvider
          contentWidth={props.width}
          contentHeight={props.height}
          inputScale={props.scale}
        >
          <DrawProvider>
            <ActionProvider>
              <CanvasFrame />
              <CanvasWaves />
              <CanvasDecoration />
              <CanvasTimeline
                areaRef={areaRef}
                currentTime={props.currentTime}
              />
              <CanvasCover />
              <CanvasMouse
                areaRef={areaRef}
                selectable={props.selectable}
                initNormalize={props.normalize}
              />
            </ActionProvider>
          </DrawProvider>
        </ScaleProvider>
      </DataProvider>
    </Area>
  );
};

export default Waves;
