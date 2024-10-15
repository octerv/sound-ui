import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { CANVAS_PADDING } from "../constants";
import { TimeScale } from "sound-ui/types";

interface ScaleContextType {
  contentWidth: number; // 描画を行うキャンバスの幅（指定された固定サイズ）
  contentHeight: number; // 描画を行うキャンバスの高さ（指定された固定サイズ）
  canvasWidth: number; // 波形を描画するバックスクリーンキャンバスの幅
  setCanvasWidth: (width: number) => void;
  graphWidth: number; // 描画キャンバス内の波形を表示する幅
  zoomLevel: number;
  setZoomLevel: (zoomLevel: number) => void;
  timeScales: TimeScale[];
  setTimeScales: (timeScales: TimeScale[]) => void;
  scrollLeft: number;
  setScrollLeft: (left: number) => void;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

type ScaleProviderProps = {
  children: ReactNode;
  contentWidth: number;
  contentHeight: number;
  inputZoomLevel?: number;
};

export const ScaleProvider = ({
  children,
  contentWidth,
  contentHeight,
  inputZoomLevel = 1.0,
}: ScaleProviderProps) => {
  const [canvasWidth, setCanvasWidth] = useState<number>(contentWidth);
  const graphWidth = contentWidth - CANVAS_PADDING * 2;
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [timeScales, setTimeScales] = useState<TimeScale[]>([]);
  // Paddingは以下の設計
  // | Content | CANVAS_PADDING | Canvas | GRAPH_PADDING | Graph | GRAPH_PADDING | Canvas | CANVAS_PADDING | Content |

  useEffect(() => setZoomLevel(inputZoomLevel), [inputZoomLevel]);

  return (
    <ScaleContext.Provider
      value={{
        contentWidth,
        contentHeight,
        canvasWidth,
        setCanvasWidth,
        graphWidth,
        zoomLevel,
        setZoomLevel,
        timeScales,
        setTimeScales,
        scrollLeft,
        setScrollLeft,
      }}
    >
      {children}
    </ScaleContext.Provider>
  );
};

export const useScaleContext = () => {
  const context = useContext(ScaleContext);
  if (!context) {
    throw new Error("useScaleContext must be used within a ScaleProvider");
  }
  return context;
};
