import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface ScaleContextType {
  scale: number;
  setScale: (scale: number) => void;
  width: number;
  canvasWidth: number;
  setCanvasWidth: (width: number) => void;
  canvasScrollLeft: number;
  setCanvasScrollLeft: (left: number) => void;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

type ScaleProviderProps = {
  children: ReactNode;
  width: number;
};

export const ScaleProvider = ({ children, width }: ScaleProviderProps) => {
  const [scale, setScale] = useState<number>(1.0);
  const [canvasWidth, setCanvasWidth] = useState<number>(width);
  const [canvasScrollLeft, setCanvasScrollLeft] = useState<number>(0);

  useEffect(() => {
    let newWidth = width * scale;
    if (newWidth < width) {
      setCanvasWidth(width);
      setScale(1.0);
    } else {
      setCanvasWidth(newWidth);
    }
  }, [scale]);

  return (
    <ScaleContext.Provider
      value={{
        scale,
        setScale,
        width,
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
