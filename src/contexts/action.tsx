import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { Position } from "sound-ui/types";

interface ActionContextType {
  cursorPosition: Position;
  setCursorPosition: (position: Position) => void;
  selecting: boolean;
  setSelecting: (selecting: boolean) => void;
  selectedRange: number[];
  setSelectedRange: (selectedRange: number[]) => void;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

type ActionProviderProps = {
  children: ReactNode;
};

export const ActionProvider = ({ children }: ActionProviderProps) => {
  const [cursorPosition, setCursorPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [selecting, setSelecting] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<number[]>([]);

  return (
    <ActionContext.Provider
      value={{
        cursorPosition,
        setCursorPosition,
        selecting,
        setSelecting,
        selectedRange,
        setSelectedRange,
      }}
    >
      {children}
    </ActionContext.Provider>
  );
};

export const useActionContext = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error("useActionContext must be used within a ActionProvider");
  }
  return context;
};
