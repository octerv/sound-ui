import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { Annotation } from "sound-ui/types";
import { useAudioBuffer, useAudioContext } from "../effects.audio";

interface DataContextType {
  // load audio
  dataUrl: string;
  setDataUrl: (dataUrl: string) => void;
  // audio data
  audioCtx: AudioContext | null;
  audioBuffer: AudioBuffer | null;
  numberOfChannels: number;
  sampleRate: number;
  duration: number; // second(14.999)
  // display audio
  mono: boolean;
  setMono: (mono: boolean) => void;
  normalize: boolean;
  setNormalize: (normalize: boolean) => void;
  // control audio
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  clickable: boolean;
  setClickable: (clickable: boolean) => void;
  clickedTime: number;
  setClickedTime: (clickedTime: number) => void;
  // annotation
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  confThreshold: number;
  setConfThreshold: (threshold: number) => void;
  // edit
  selectable: boolean;
  setSelectable: (selectable: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

type DataProviderProps = {
  children: ReactNode;
};

export const DataProvider = ({ children }: DataProviderProps) => {
  const [dataUrl, setDataUrl] = useState<string>("");
  const audioCtx = useAudioContext(dataUrl);
  const {
    buffer: audioBuffer,
    numberOfChannels,
    sampleRate,
    duration,
  } = useAudioBuffer(dataUrl, audioCtx);
  const [mono, setMono] = useState<boolean>(false);
  const [normalize, setNormalize] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [clickable, setClickable] = useState<boolean>(false);
  const [clickedTime, setClickedTime] = useState<number>(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [confThreshold, setConfThreshold] = useState<number>(0.0);
  const [selectable, setSelectable] = useState<boolean>(false);

  return (
    <DataContext.Provider
      value={{
        dataUrl,
        setDataUrl,
        audioCtx,
        audioBuffer,
        numberOfChannels,
        sampleRate,
        duration,
        mono,
        setMono,
        normalize,
        setNormalize,
        currentTime,
        setCurrentTime,
        clickable,
        setClickable,
        clickedTime,
        setClickedTime,
        annotations,
        setAnnotations,
        confThreshold,
        setConfThreshold,
        selectable,
        setSelectable,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};
