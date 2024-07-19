import { useEffect, useRef } from "react";
import { WavesProps } from "sound-ui/types";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";
import { getTimePosition } from "../functions.time";

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
    setMono,
    setSelectable,
  } = useDataContext();
  const { canvasWidth, canvasScrollLeft } = useScaleContext();

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
    const { x } = getTimePosition(canvasWidth, duration, props.currentTime);
    const centerPosition = x - props.areaRef.current.offsetWidth / 2;
    props.areaRef.current.scrollLeft = centerPosition;
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

  // ---------- edit ----------
  useEffect(() => {
    const toSelectable =
      props.selectable === undefined ? false : props.selectable;
    console.info(`[info] update selectable: ${toSelectable}`);
    setSelectable(toSelectable);
  }, [props.selectable]);

  // ---------- scaling ----------
  useEffect(() => {
    if (!props.areaRef.current) return;
    props.areaRef.current.scrollLeft = canvasScrollLeft;
  }, [canvasScrollLeft]);

  return null;
};

export default Controller;
