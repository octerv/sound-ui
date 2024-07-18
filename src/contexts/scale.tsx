import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { CANVAS_PADDING, GRAPH_PADDING } from "../constants";

interface ScaleContextType {
  contentWidth: number;
  contentHeight: number;
  scale: number;
  setScale: (scale: number) => void;
  canvasWidth: number;
  setCanvasWidth: (width: number) => void;
  canvasScrollLeft: number;
  setCanvasScrollLeft: (left: number) => void;
  graphWidth: number;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

type ScaleProviderProps = {
  children: ReactNode;
  contentWidth: number;
  contentHeight: number;
  inputScale?: number;
};

export const ScaleProvider = ({
  children,
  contentWidth,
  contentHeight,
  inputScale = 1.0,
}: ScaleProviderProps) => {
  const [scale, setScale] = useState<number>(1.0);
  const [canvasWidth, setCanvasWidth] = useState<number>(contentWidth);
  const [canvasScrollLeft, setCanvasScrollLeft] = useState<number>(0);
  const [graphWidth, setGraphWidth] = useState<number>(
    contentWidth - CANVAS_PADDING * 2 - GRAPH_PADDING * 2
  );
  // Paddingは以下の設計
  // | Content | CANVAS_PADDING | Canvas | GRAPH_PADDING | Graph | GRAPH_PADDING | Canvas | CANVAS_PADDING | Content |

  useEffect(() => {
    let newWidth = contentWidth * scale;
    if (newWidth < contentWidth) {
      setCanvasWidth(contentWidth);
      setScale(1.0);
    } else {
      setCanvasWidth(newWidth);
    }
  }, [scale]);

  useEffect(() => setScale(inputScale), [inputScale]);

  return (
    <ScaleContext.Provider
      value={{
        contentWidth,
        contentHeight,
        scale,
        setScale,
        canvasWidth,
        setCanvasWidth,
        canvasScrollLeft,
        setCanvasScrollLeft,
        graphWidth,
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
