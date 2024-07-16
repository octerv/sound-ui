import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface DrawContextType {
  drawing: boolean;
  setDrawing: (drawing: boolean) => void;
  drawn: boolean;
  setDrawn: (drawn: boolean) => void;
}

const DrawContext = createContext<DrawContextType | undefined>(undefined);

type DrawProviderProps = {
  children: ReactNode;
};

export const DrawProvider = ({ children }: DrawProviderProps) => {
  const [drawing, setDrawing] = useState<boolean>(false);
  const [drawn, setDrawn] = useState<boolean>(false);

  return (
    <DrawContext.Provider
      value={{
        drawing,
        setDrawing,
        drawn,
        setDrawn,
      }}
    >
      {children}
    </DrawContext.Provider>
  );
};

export const useDrawContext = () => {
  const context = useContext(DrawContext);
  if (!context) {
    throw new Error("useDrawContext must be used within a DrawProvider");
  }
  return context;
};
