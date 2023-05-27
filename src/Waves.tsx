import React from "react";
import { useEffect, useRef, useState } from "react";
import {
  useCanvasClear,
  useScaleEffect,
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
import CanvasTimeline from "./components/canvas-timeline";
import { getMaxArea } from "./Waves.functions";

const constants = {
  CANVAS_PADDING: 8,
  GRAPH_PADDING: 8,
  VERTICAL_SCALE_HEIGHT: 24,
  VERTICAL_SLIDE_WIDTH: 8,
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Component
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
const Waves = (props: WavesProps) => {
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Ref
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const canvasFrameRef = useRef<HTMLCanvasElement>(null);
  const canvasWavesRef = useRef<HTMLCanvasElement>(null);
  const canvasDecorationRef = useRef<HTMLCanvasElement>(null);
  const canvasMouseRef = useRef<HTMLCanvasElement>(null);
  const canvasTimelineRef = useRef<HTMLCanvasElement>(null);
  const canvasCoverRef = useRef<HTMLCanvasElement>(null);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // State
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const audioCtx = useAudioContext(props.dataUrl);
  const audioBuffer = useAudioBuffer(props.dataUrl, audioCtx);
  const [canvasWavesLeft, setCanvasWavesLeft] = useState(0);
  const [canvasWavesWidth, setCanvasWavesWidth] = useState(props.width);
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
  const [maxArea, setMaxArea] = useState([0, 0]);

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Effects
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
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

  useEffect(() => {
    if (!audioBuffer) return;
    if (!props.maxAreaLength) return;
    const area = getMaxArea(audioBuffer, props.maxAreaLength);
    setMaxArea(area);
    if (props.setMaxArea) props.setMaxArea(area);
  }, [audioBuffer]);

  useCanvasClear(
    props.dataUrl,
    constants,
    canvasFrameRef,
    canvasWavesRef,
    canvasDecorationRef
  );

  useScaleEffect(
    scale,
    cursorPosition,
    props,
    canvasWavesLeft,
    canvasWavesWidth,
    setCanvasWavesLeft,
    setCanvasWavesWidth
  );

  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  // Render
  //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  const areaStyle = {
    width: props.width,
    height: props.height,
    overflow: "hidden",
  };
  return (
    <Area style={areaStyle}>
      <CanvasFrame
        canvasRef={canvasFrameRef}
        constants={constants}
        audioBuffer={audioBuffer}
        width={props.width}
        height={props.height}
        stereo={props.stereo}
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
        stereo={props.stereo}
        setDrew={setDrew}
        setDrawing={setDrawing}
        setScaling={setScaling}
      />
      <CanvasDecoration
        canvasRef={canvasDecorationRef}
        constants={constants}
        audioBuffer={audioBuffer}
        width={canvasWavesWidth}
        height={props.height}
        left={canvasWavesLeft}
        cursorPosition={cursorPosition}
        selectedRanges={selectedRanges}
        selectingRange={selectingRange}
        scale={scale}
        drawing={drawing}
        maxArea={maxArea}
      />
      <CanvasTimeline
        canvasRef={canvasTimelineRef}
        constants={constants}
        audioBuffer={audioBuffer}
        width={canvasWavesWidth}
        height={props.height}
        left={canvasWavesLeft}
        scale={scale}
        stereo={props.stereo}
        currentTime={props.currentTime}
      />
      <CanvasCover
        canvasRef={canvasCoverRef}
        constants={constants}
        audioBuffer={audioBuffer}
        width={props.width}
        height={props.height}
        stereo={props.stereo}
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

export default Waves;
