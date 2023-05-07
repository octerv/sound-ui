import React from "react";
import { useEffect, useRef, useState } from "react";
import {
  useCanvasClear,
  effectScale,
  useSelectedRanges,
  useAudioBuffer,
  useAudioContext,
} from "./Waves.effects";
import { Area } from "./components/styled";
import CanvasFrame from "./components/canvas-frame";
import CanvasWaves from "./components/canvas-waves";
import CanvasDecoration from "./components/canvas-decoration";
import CanvasCover from "./components/canvas-cover";
import CanvasMouse from "./components/canvas-mouse";
import { Position, WavesProps } from "./Waves.types";

const constants = {
  CANVAS_PADDING: 8,
  GRAPH_PADDING: 8,
  VERTICAL_SCALE_HEIGHT: 24,
  VERTICAL_SLIDE_WIDTH: 8,
};

export const Waves = (props: WavesProps) => {
  const canvasFrameRef = useRef<HTMLCanvasElement>(null);
  const canvasWavesRef = useRef<HTMLCanvasElement>(null);
  const canvasDecorationRef = useRef<HTMLCanvasElement>(null);
  const canvasMouseRef = useRef<HTMLCanvasElement>(null);
  const canvasCoverRef = useRef<HTMLCanvasElement>(null);
  const [canvasWavesLeft, setCanvasWavesLeft] = useState(0);
  const [canvasWavesWidth, setCanvasWavesWidth] = useState(props.width);
  const audioCtx = useAudioContext(props.dataUrl);
  const audioBuffer = useAudioBuffer(props.dataUrl, audioCtx);
  const [drawing, setDrawing] = useState(false);
  const [drew, setDrew] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [scale, setScale] = useState(1.0);
  const [scaling, setScaling] = useState(false);
  const [normalize, setNormalize] = useState(
    props.normalize ? props.normalize === true : false
  );
  const [selectingRange, setSelectingRange] = useState(false);
  const selectedRanges = useSelectedRanges(
    selectingRange,
    cursorPosition,
    scale,
    canvasWavesLeft,
    drew,
    constants,
    canvasMouseRef
  );

  useCanvasClear(
    props.dataUrl,
    constants,
    canvasFrameRef,
    canvasWavesRef,
    canvasDecorationRef
  );

  useEffect(() => {
    if (!drew) return;
    if (props.normalize === undefined || props.normalize === null) return;
    if (props.normalize === normalize) return;
    console.info(`[info] normalize: ${props.normalize}`);
    setNormalize(props.normalize);
    setDrawing(true);
  }, [props.normalize]);

  useEffect(() => {
    if (!drew) return;
    console.info(`[info] rescale: ${scale}`);
    setDrawing(true);
  }, [canvasWavesWidth]);

  effectScale(
    scale,
    cursorPosition,
    props,
    canvasWavesLeft,
    canvasWavesWidth,
    setCanvasWavesLeft,
    setCanvasWavesWidth
  );

  const areaStyle = {
    width: props.width,
    height: props.height,
    overflow: "hidden",
  };
  const wavesStyle = {
    left: canvasWavesLeft,
  };
  return (
    <Area style={areaStyle}>
      <CanvasFrame
        canvasRef={canvasFrameRef}
        constants={constants}
        audioBuffer={audioBuffer}
        width={props.width}
        height={props.height}
      />
      <CanvasWaves
        canvasRef={canvasWavesRef}
        constants={constants}
        audioBuffer={audioBuffer}
        width={canvasWavesWidth}
        height={props.height}
        left={canvasWavesLeft}
        samplingLevel={props.samplingLevel}
        normalize={normalize}
        drawing={drawing}
        setDrew={setDrew}
        setDrawing={setDrawing}
        setScaling={setScaling}
      />
      <CanvasDecoration
        canvasRef={canvasDecorationRef}
        constants={constants}
        width={canvasWavesWidth}
        height={props.height}
        left={canvasWavesLeft}
        cursorPosition={cursorPosition}
        selectedRanges={selectedRanges}
        selectingRange={selectingRange}
        scale={scale}
        drawing={drawing}
      />
      <CanvasCover
        canvasRef={canvasCoverRef}
        constants={constants}
        audioBuffer={audioBuffer}
        width={props.width}
        height={props.height}
      />
      <CanvasMouse
        canvasRef={canvasMouseRef}
        constants={constants}
        audioBuffer={audioBuffer}
        enable={drew}
        selectable={props.selectable}
        width={canvasWavesWidth}
        height={props.height}
        left={canvasWavesLeft}
        drew={drew}
        scale={scale}
        scaling={scaling}
        cursorPosition={cursorPosition}
        setSelectingRange={setSelectingRange}
        setCursorPosition={setCursorPosition}
        setScale={setScale}
        setScaling={setScaling}
        setCanvasWavesLeft={setCanvasWavesLeft}
      />
    </Area>
  );
};
