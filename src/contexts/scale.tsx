import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface ScaleContextType {
  scale: number;
  setScale: (scale: number) => void;
  canvasWavesLeft: number;
  setCanvasWavesLeft: (left: number) => void;
  canvasWavesWidth: number;
  setCanvasWavesWidth: (width: number) => void;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

type ScaleProviderProps = {
  children: ReactNode;
  width: number;
};

export const ScaleProvider = ({ children, width }: ScaleProviderProps) => {
  const [scale, setScale] = useState<number>(1.0);
  const [canvasWavesLeft, setCanvasWavesLeft] = useState<number>(0);
  const [canvasWavesWidth, setCanvasWavesWidth] = useState<number>(width);

  return (
    <ScaleContext.Provider
      value={{
        scale,
        setScale,
        canvasWavesLeft,
        setCanvasWavesLeft,
        canvasWavesWidth,
        setCanvasWavesWidth,
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
