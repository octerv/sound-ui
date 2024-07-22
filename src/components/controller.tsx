import { useEffect, useRef } from "react";
import { WavesProps } from "sound-ui/types";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";
import { getTimePosition } from "../functions.time";
import { useActionContext } from "../contexts/action";

interface Props extends WavesProps {
  areaRef: React.RefObject<HTMLDivElement>;
}

const Controller = (props: Props) => {
  const {
    setDataUrl,
    duration,
    currentTime,
    setCurrentTime,
    setClickable,
    clickedTime,
    setAnnotations,
    setConfThreshold,
    setMono,
    setSelectable,
  } = useDataContext();
  const {
    contentWidth,
    scale,
    setScale,
    canvasWidth,
    setCanvasWidth,
    scrollLeft,
    setScrollLeft,
  } = useScaleContext();
  const { cursorPosition, setCursorPosition } = useActionContext();

  // ---------- Refs ----------
  const isClickedTime = useRef<boolean>(false);

  // ---------- load audio ----------
  useEffect(() => {
    if (!props.dataUrl) return;
    console.info("[info] update dataUrl");
    setDataUrl(props.dataUrl);
    setAnnotations([]);
  }, [props.dataUrl]);

  // ---------- display audio ----------
  useEffect(() => {
    const toMono = props.mono === undefined ? false : props.mono;
    console.info(`[info] update mono: ${toMono}`);
    setMono(toMono);
  }, [props.mono]);

  useEffect(() => {
    // Canvasの幅を変更
    const newCanvasWidth = contentWidth * scale;
    if (newCanvasWidth < contentWidth) {
      setCanvasWidth(contentWidth);
      setScale(1.0);
      return;
    }
    setCanvasWidth(newCanvasWidth);

    // 新しいカーソル位置を計算
    const prevScale = Math.floor((canvasWidth / contentWidth) * 10) / 10;
    const newCursorPositionX = (cursorPosition.x / prevScale) * scale;
    setCursorPosition({ x: newCursorPositionX, y: cursorPosition.y });

    // 新しいスクロール位置を計算
    if (!props.areaRef.current) return;
    // カーソルのビューポート内での相対位置を保持
    const cursorRelativePositionX =
      cursorPosition.x - props.areaRef.current.scrollLeft;
    const newScrollLeft = newCursorPositionX - cursorRelativePositionX;
    setScrollLeft(newScrollLeft);
  }, [scale]);

  useEffect(() => {
    // 自動スクロール
    if (!props.areaRef.current) return;
    props.areaRef.current.scrollLeft = scrollLeft;
  }, [scrollLeft]);

  // ---------- control audio ----------
  useEffect(() => {
    if (!props.currentTime) return;
    setCurrentTime(props.currentTime);

    // 自動スクロール
    if (!props.areaRef.current) return;
    if (isClickedTime.current) {
      // クリックして再生位置を指定された場合は自動スクロールしない
      isClickedTime.current = false;
      return;
    }
    // 再生位置が中心となるようなスクロール位置を計算
    const { x } = getTimePosition(canvasWidth, duration, props.currentTime);
    const newScrollLeft = x - props.areaRef.current.offsetWidth / 2;
    setScrollLeft(newScrollLeft);
  }, [props.currentTime]);

  useEffect(() => {
    const toClickable = props.clickable === undefined ? false : props.clickable;
    console.info(`[info] update clickable: ${toClickable}`);
    setClickable(toClickable);
  }, [props.clickable]);

  useEffect(() => {
    if (currentTime === 0 && clickedTime === 0) return;
    if (props.setPlayPosition) {
      props.setPlayPosition(clickedTime);
      isClickedTime.current = true;
    }
  }, [clickedTime]);

  // ---------- annotation ----------
  useEffect(() => {
    if (!props.annotations) return;
    console.info("[info] update annotations");
    setAnnotations(props.annotations);
  }, [props.annotations]);

  useEffect(() => {
    if (!props.confThreshold) return;
    console.info(`[info] update confidence threshold: ${props.confThreshold}`);
    setConfThreshold(props.confThreshold);
  }, [props.confThreshold]);

  // ---------- edit ----------
  useEffect(() => {
    const toSelectable =
      props.selectable === undefined ? false : props.selectable;
    console.info(`[info] update selectable: ${toSelectable}`);
    setSelectable(toSelectable);
  }, [props.selectable]);

  return null;
};

export default Controller;
