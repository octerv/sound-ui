import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface ScaleContextType {
  contentWidth: number;
  contentHeight: number;
  scale: number;
  setScale: (scale: number) => void;
  canvasWidth: number;
  setCanvasWidth: (width: number) => void;
  canvasScrollLeft: number;
  setCanvasScrollLeft: (left: number) => void;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

type ScaleProviderProps = {
  children: ReactNode;
  contentWidth: number;
  contentHeight: number;
};

export const ScaleProvider = ({
  children,
  contentWidth,
  contentHeight,
}: ScaleProviderProps) => {
  const [scale, setScale] = useState<number>(1.0);
  const [canvasWidth, setCanvasWidth] = useState<number>(contentWidth);
  const [canvasScrollLeft, setCanvasScrollLeft] = useState<number>(0);

  useEffect(() => {
    let newWidth = contentWidth * scale;
    if (newWidth < contentWidth) {
      setCanvasWidth(contentWidth);
      setScale(1.0);
    } else {
      setCanvasWidth(newWidth);
    }
  }, [scale]);

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
