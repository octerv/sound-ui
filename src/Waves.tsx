import React from "react";
import { startTransition, useEffect, useRef, useState } from "react";
import {
  clearCanvas,
  effectCursor,
  effectScale,
  effectSelectedRanges,
  useAudioBuffer,
  useAudioContext,
} from "./Waves.effects";
import { drawSelectedRanges, drawWaves } from "./Waves.functions";
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
  const [selectedRanges, setSelectedRanges] = useState<number[]>([]);
  const [selectingRange, setSelectingRange] = useState(false);

  clearCanvas(
    props.dataUrl,
    constants,
    canvasFrameRef,
    canvasWavesRef,
    canvasDecorationRef
  );

  useEffect(() => {
    if (!drawing) return;
    if (!audioBuffer) return;
    if (!canvasWavesRef || !canvasWavesRef.current) return;
    if (!canvasMouseRef || !canvasMouseRef.current) return;
    // draw waves
    startTransition(() => {
      drawWaves(
        audioBuffer,
        canvasWavesRef,
        constants,
        normalize,
        canvasWavesWidth,
        props.samplingLevel || 0.001
      );
      drawSelectedRanges(
        canvasDecorationRef,
        constants,
        canvasWavesWidth,
        selectedRanges,
        cursorPosition,
        selectingRange,
        scale
      );
      console.log("[success] drew");
      setScaling(false);
      setDrawing(false);
      setDrew(true);
    });
  }, [drawing]);

  useEffect(() => {
    if (!drew) return;
    if (props.normalize === undefined || props.normalize === null) return;
    if (props.normalize === normalize) return;
    console.log(`[info] normalize: ${props.normalize}`);
    setNormalize(props.normalize);
    setDrawing(true);
  }, [props.normalize]);

  useEffect(() => {
    if (!drew) return;
    console.log(`[info] rescale: ${scale}`);
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

  effectCursor(
    cursorPosition,
    constants,
    audioBuffer,
    canvasMouseRef,
    drew,
    canvasWavesLeft,
    canvasWavesWidth,
    scale
  );

  effectSelectedRanges(
    selectingRange,
    selectedRanges,
    cursorPosition,
    scale,
    canvasWavesLeft,
    drew,
    constants,
    canvasMouseRef,
    setSelectedRanges
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
        audioBuffer={audioBuffer}
        width={canvasWavesWidth}
        height={props.height}
        left={canvasWavesLeft}
        setDrawing={setDrawing}
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
        enable={drew}
        selectable={props.selectable}
        width={canvasWavesWidth}
        height={props.height}
        left={canvasWavesLeft}
        scale={scale}
        scaling={scaling}
        setSelectingRange={setSelectingRange}
        setCursorPosition={setCursorPosition}
        setScale={setScale}
        setScaling={setScaling}
        setCanvasWavesLeft={setCanvasWavesLeft}
      />
    </Area>
  );
};
