import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Annotation } from "sound-ui/types";
import { useAudioBuffer, useAudioContext } from "../effects.audio";

interface DataContextType {
  dataUrl: string;
  audioCtx: AudioContext | null;
  audioBuffer: AudioBuffer | null;
  numberOfChannels: number;
  sampleRate: number;
  duration: number; // second(14.999)
  mono: boolean | undefined;
  normalize: boolean;
  setNormalize: (normalize: boolean) => void;
  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

type DataProviderProps = {
  children: ReactNode;
  dataUrl: string;
  inputAnnotations: Annotation[] | undefined;
  mono: boolean | undefined;
};

export const DataProvider = ({
  children,
  dataUrl,
  inputAnnotations,
  mono,
}: DataProviderProps) => {
  const audioCtx = useAudioContext(dataUrl);
  const {
    buffer: audioBuffer,
    numberOfChannels,
    sampleRate,
    duration,
  } = useAudioBuffer(dataUrl, audioCtx);
  const [normalize, setNormalize] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    setAnnotations([]);
  }, [dataUrl]);

  useEffect(() => {
    if (!inputAnnotations) return;
    setAnnotations(inputAnnotations);
  }, [inputAnnotations]);

  return (
    <DataContext.Provider
      value={{
        dataUrl,
        audioCtx,
        audioBuffer,
        numberOfChannels,
        sampleRate,
        duration,
        mono,
        normalize,
        setNormalize,
        annotations,
        setAnnotations,
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
