import React from "react";
import { startTransition, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
  clearCanvas,
  effectCursor,
  effectScale,
  effectSelectedRanges,
  setupCoverCanvas,
  setupFrameCanvas,
  setupMouseCanvas,
  setupWavesCanvas,
  updateFrameCanvas,
  useAudioBuffer,
  useAudioContext,
} from "./Waves.effects";
import { drawSelectedRanges, drawWaves } from "./Waves.functions";

const constants = {
  CANVAS_PADDING: 8,
  GRAPH_PADDING: 8,
  VERTICAL_SCALE_HEIGHT: 24,
  VERTICAL_SLIDE_WIDTH: 8,
};

const Area = styled.div`
  display: flex;
  position: relative;
  margin: 0px;
  padding: 0px;
`;

const Content = styled.canvas`
  position: absolute;
  margin: 0px;
  padding: 0px;
  top: 0;
  left: 0;
  opacity: 0.9;
`;

export type WavesProps = {
  dataUrl: string;
  width: number;
  height: number;
  samplingLevel?: number; // max: 0.001, 0.01, 0.1, 1.0など
  normalize?: boolean;
  selectable?: boolean;
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
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1.0);
  const [scaling, setScaling] = useState(false);
  const [normalize, setNormalize] = useState(
    props.normalize ? props.normalize === true : false
  );
  const [selectedRanges, setSelectedRanges] = useState<number[]>([]);
  const [selectingRange, setSelectingRange] = useState(false);
  const [registeredEvents, setRegisteredEvent] = useState(false);

  // event listener用 useRef
  const scaleRef = useRef<number>();
  scaleRef.current = scale;
  const scalingRef = useRef<boolean>();
  scalingRef.current = scaling;
  const canvasWavesLeftRef = useRef<number>();
  canvasWavesLeftRef.current = canvasWavesLeft;
  const canvasWavesWidthRef = useRef<number>();
  canvasWavesWidthRef.current = canvasWavesWidth;

  setupFrameCanvas(canvasFrameRef);
  setupWavesCanvas(canvasWavesRef);
  setupMouseCanvas(canvasMouseRef);
  setupCoverCanvas(canvasCoverRef, constants, audioBuffer);
  updateFrameCanvas(canvasFrameRef, constants, audioBuffer);
  clearCanvas(
    props.dataUrl,
    constants,
    canvasFrameRef,
    canvasWavesRef,
    canvasDecorationRef
  );

  useEffect(() => {
    if (!audioBuffer) return;
    if (!canvasWavesRef || !canvasWavesRef.current) return;
    setDrawing(true);
  }, [audioBuffer]);

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

      if (registeredEvents) return;

      // set mouse event listener
      if (canvasMouseRef && canvasMouseRef.current) {
        canvasMouseRef.current.addEventListener("mousemove", onMouseMove);
        canvasMouseRef.current.addEventListener("wheel", onMouseWheel, {
          passive: false,
        });
        setRegisteredEvent(true);
      }
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
    canvasDecorationRef,
    drew,
    canvasWavesLeft,
    canvasWavesWidth,
    selectingRange,
    selectedRanges,
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

  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canvasMouseRef || !canvasMouseRef.current) return;

    const rect = canvasMouseRef.current.getBoundingClientRect();
    const posX = e.clientX - rect.left;
    const posY = e.clientY - rect.top;

    // scale center
    setCursorPosition({ x: posX, y: posY });
  };

  const onMouseWheel = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (scalingRef.current) return;

    // 縦スクロールで拡大縮小
    if (e.deltaY !== 0) {
      let newScale = scaleRef.current || 1.0;
      if (e.deltaY > 4) {
        newScale = Math.floor((newScale + 0.2) * 100) / 100;
      } else if (e.deltaY < -4) {
        newScale = Math.floor((newScale - 0.2) * 100) / 100;
      }

      if (newScale >= 1.0 && newScale <= 2.0 && scaleRef.current !== newScale) {
        setScale(newScale);
        setScaling(true);
      }
    }

    // 横スクロールで位置移動
    if (e.deltaX !== 0) {
      const currentWidth = canvasWavesWidthRef.current || props.width;
      if (currentWidth === props.width) return;

      let newLeft = canvasWavesLeftRef.current || 0;
      if (e.deltaX > 2) {
        newLeft = newLeft - constants.VERTICAL_SLIDE_WIDTH;
      } else if (e.deltaX < -2) {
        newLeft = newLeft + constants.VERTICAL_SLIDE_WIDTH;
      }

      if (newLeft <= 0 && newLeft >= props.width - currentWidth) {
        setCanvasWavesLeft(newLeft);
      }
    }
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drew) return;
    if (!props.selectable) return;
    setSelectingRange(true);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drew) return;
    if (!props.selectable) return;
    setSelectingRange(false);
  };

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
      <Content width={props.width} height={props.height} ref={canvasFrameRef} />
      <Content
        width={canvasWavesWidth}
        height={props.height}
        style={wavesStyle}
        ref={canvasWavesRef}
      />
      <Content
        width={canvasWavesWidth}
        height={props.height}
        style={wavesStyle}
        ref={canvasDecorationRef}
      />
      <Content width={props.width} height={props.height} ref={canvasCoverRef} />
      <Content
        width={canvasWavesWidth}
        height={props.height}
        style={wavesStyle}
        ref={canvasMouseRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      />
    </Area>
  );
};
