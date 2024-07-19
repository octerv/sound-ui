import React, { useEffect, useRef, useState } from "react";
import { FrequencyConfig, SynthesisProps } from "./Synthesis.types";
import { Area } from "./components/styled";
import CanvasFrame from "./components/canvas-frame";
import CanvasWavePeriod from "./components/canvas-wave-period";
import { createAudioBuffer, synthesisWaves } from "./functions.audio";
import { DataProvider } from "./contexts/data";
import { ScaleProvider } from "./contexts/scale";

const constants = {
  CANVAS_PADDING: 8,
  GRAPH_PADDING: 8,
  VERTICAL_SCALE_HEIGHT: 24,
  VERTICAL_SLIDE_WIDTH: 8,
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const Synthesis = (props: SynthesisProps) => {
  const duration = props.duration || 1;
  const frequencies = props.frequencies
    ? props.frequencies.map((item: FrequencyConfig) => item.frequency)
    : [440];
  const height = Math.floor(
    (props.width - constants.CANVAS_PADDING * 2) / (frequencies.length + 2)
  );
  const min = Math.min(...frequencies);
  const period = 1 / min;

  // Refs
  const canvasFrameRef = useRef<HTMLCanvasElement>(null);
  const canvasWavePeriodRef = useRef<HTMLCanvasElement>(null);

  // States
  const [waves, setWaves] = useState<JSX.Element[] | null>(null);
  const [buffers, setBuffers] = useState<AudioBuffer[]>([]);

  // Effects
  useEffect(() => {
    if (!props.audioContext) return;
    if (!props.frequencies) return;

    const newBuffers = [];
    const newWaves = [];
    for (let i = 0; i < frequencies.length; i++) {
      const config = props.frequencies[i];
      const top = Math.floor(height * i + constants.CANVAS_PADDING);
      const buffer = createAudioBuffer(
        props.audioContext,
        duration,
        config.frequency,
        config.volume
      );
      newBuffers.push(buffer);
      newWaves.push(
        <CanvasWavePeriod
          key={i}
          canvasRef={canvasWavePeriodRef}
          audioBuffer={buffer}
          top={top}
          left={0}
          height={height}
          period={period}
          frequency={frequencies[i]}
        />
      );
    }

    // 合成波の表示
    const top = Math.floor(
      height * frequencies.length + constants.CANVAS_PADDING
    );
    const synBuffer = synthesisWaves(props.audioContext, newBuffers);
    newWaves.push(
      <CanvasWavePeriod
        key={frequencies.length + 1}
        canvasRef={canvasWavePeriodRef}
        audioBuffer={synBuffer}
        top={top}
        left={0}
        height={height * 2}
        period={period}
      />
    );

    setBuffers(newBuffers);
    setWaves(newWaves);
  }, [props.audioContext]);

  useEffect(() => {
    if (!props.audioContext) return;
    if (props.playing == undefined) return;
    if (props.playing >= 0) {
      for (let i = 0; i < buffers.length; i++) {
        const source = props.audioContext.createBufferSource();
        source.buffer = buffers[i];
        source.connect(props.audioContext.destination);
        source.start();
      }
    }
  }, [props.playing]);

  const areaStyle = {
    width: props.width,
    height: props.height,
    overflow: "hidden",
  };
  return (
    <Area style={areaStyle}>
      <DataProvider>
        <ScaleProvider contentWidth={props.width} contentHeight={props.height}>
          <CanvasFrame />

          {waves}
        </ScaleProvider>
      </DataProvider>
    </Area>
  );
};

export default Synthesis;
