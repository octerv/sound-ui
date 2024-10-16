import { useEffect, useRef } from "react";
import { WavesProps } from "sound-ui/types";
import { useDataContext } from "../contexts/data";
import { useScaleContext } from "../contexts/scale";
import { getTimePosition, getTimeScales } from "../functions.time";
import { useActionContext } from "../contexts/action";
import { useDrawContext } from "../contexts/draw";
import { CANVAS_PADDING } from "../constants";

interface Props extends WavesProps {
  areaRef: React.RefObject<HTMLDivElement>;
}

const Controller = (props: Props) => {
  // -----------------------------------------------------------------------------
  // Section: 変数の読み込みと定義
  // -----------------------------------------------------------------------------
  const {
    setDataUrl,
    audioBuffer,
    duration,
    currentTime,
    setCurrentTime,
    setCurrentTimeX,
    setClickable,
    clickedTime,
    setAnnotations,
    setClasses,
    setConfThreshold,
    setMono,
    setSelectable,
  } = useDataContext();
  const {
    contentWidth,
    zoomLevel,
    setZoomLevel,
    canvasWidth,
    setCanvasWidth,
    graphWidth,
    setTimeScales,
    scrollLeft,
    setScrollLeft,
  } = useScaleContext();
  const { drawn } = useDrawContext();
  const { cursorPosition } = useActionContext();

  // ---------- Refs ----------
  const isClickedTime = useRef<boolean>(false);

  // -----------------------------------------------------------------------------
  // Section: オーディオの指定に関する操作
  // -----------------------------------------------------------------------------

  // オーディオが指定されるたびに初期値をセットする
  useEffect(() => {
    if (!props.dataUrl) return;
    console.info("[info] update dataUrl");
    setDataUrl(props.dataUrl);
    setCurrentTimeX(0);
    setAnnotations([]);
  }, [props.dataUrl]);

  // モノラル表示かステレオ表示か変更された場合にフラグを変更する
  useEffect(() => {
    const toMono = props.mono === undefined ? false : props.mono;
    console.info(`[info] update mono: ${toMono}`);
    setMono(toMono);
  }, [props.mono]);

  // -----------------------------------------------------------------------------
  // Section: 描画内容の変更に関する操作
  // -----------------------------------------------------------------------------

  // 拡大縮小された場合に拡大率、スクロール位置、現在再生位置、キャンバスの幅を再設定する
  useEffect(() => {
    if (!audioBuffer) return;
    console.info(`[info] update zoomLevel: ${zoomLevel}`);

    // 再生位置を取得
    const { x: px } = getTimePosition(canvasWidth, duration, currentTime);
    let newCanvasWidth = contentWidth * zoomLevel;
    const { x: nx } = getTimePosition(newCanvasWidth, duration, currentTime);
    let newScrollLeft = 0;

    if (newCanvasWidth <= contentWidth) {
      newCanvasWidth = contentWidth;
    } else {
      // 新しいスクロール位置を計算
      const previousZoomLevel =
        Math.floor((canvasWidth / contentWidth) * 10) / 10;
      const offscreenCursorPositionX =
        ((cursorPosition.x + scrollLeft) / previousZoomLevel) * zoomLevel;
      newScrollLeft = offscreenCursorPositionX - cursorPosition.x;
    }

    // 値の調整
    if (newScrollLeft < 0) newScrollLeft = 0;

    // 時間軸のメモリを計算
    const newTimeScales = getTimeScales(audioBuffer, newCanvasWidth);

    // 値の更新
    setCanvasWidth(newCanvasWidth);
    setScrollLeft(newScrollLeft);
    setCurrentTimeX(nx - newScrollLeft);
    setTimeScales(newTimeScales);

    // 親コンポーネントに伝える
    if (props.setZoomLevel) {
      props.setZoomLevel(zoomLevel);
    }
  }, [audioBuffer, zoomLevel]);

  // -----------------------------------------------------------------------------
  // Section: オーディオの再生に関する操作
  // -----------------------------------------------------------------------------

  // オーディオ再生の時刻変化によって画面上の再生位置とスクロール量を更新する
  useEffect(() => {
    if (!props.currentTime) return;

    let newScrollLeft = 0;

    // キャンバス上の座標を取得
    const { x } = getTimePosition(canvasWidth, duration, props.currentTime);
    let newCurrentTimeX =
      zoomLevel === 1.0 ? (x / canvasWidth) * graphWidth : x - scrollLeft;
    // if (newCurrentTimeX < 0) newCurrentTimeX = 0;
    newCurrentTimeX += CANVAS_PADDING;

    if (isClickedTime.current) {
      // クリックして再生位置を指定された場合は自動スクロールしない
      isClickedTime.current = false; // フラグを戻す
    } else {
      // TODO: スクロール開始部分でカクツクので微調整が必要かと思われる
      // TODO: 拡大済みで残りがスクロール不要な場合の対応が必要
      if (newCurrentTimeX < 0) {
        newScrollLeft = x - contentWidth / 2;
        newCurrentTimeX = contentWidth / 2;
      }
      if (zoomLevel > 1.0 && newCurrentTimeX >= contentWidth / 2) {
        newScrollLeft = x - contentWidth / 2;
        newCurrentTimeX = contentWidth / 2;
      }
    }

    // 値の調整
    if (newScrollLeft < 0) newScrollLeft = 0;

    // 値の更新
    setCurrentTime(props.currentTime);
    setCurrentTimeX(newCurrentTimeX);
    setScrollLeft(newScrollLeft);
  }, [props.currentTime]);

  // 再生位置をマウスクリックで有効にするか無効にするか切り替える
  useEffect(() => {
    const toClickable = props.clickable === undefined ? false : props.clickable;
    setClickable(toClickable);
    console.info(`[info] update clickable: ${toClickable}`);
  }, [props.clickable]);

  // 再生位置をマウスでクリックされた場合、親コンポーネントに再生位置変更を伝える
  useEffect(() => {
    if (!props.clickable) return;
    if (currentTime === 0 && clickedTime === 0) return;
    console.info(`[info] update play position: ${clickedTime}`);

    setCurrentTime(clickedTime);
    isClickedTime.current = true;

    // 親コンポーネントに伝える
    if (props.setPlayPosition) {
      props.setPlayPosition(clickedTime);
    }
  }, [clickedTime]);

  // -----------------------------------------------------------------------------
  // Section: アノテーションに関する操作
  // -----------------------------------------------------------------------------

  // ---------- annotation ----------
  useEffect(() => {
    if (!props.annotations) return;
    console.info("[info] update annotations");
    setAnnotations(props.annotations);
  }, [props.annotations]);

  useEffect(() => {
    if (!props.classes) return;
    console.info("[info] update classes");
    setClasses(props.classes);
  }, [props.classes]);

  useEffect(() => {
    if (!props.confThreshold) return;
    console.info(`[info] update confidence threshold: ${props.confThreshold}`);
    setConfThreshold(props.confThreshold);
  }, [props.confThreshold]);

  useEffect(() => {
    const toSelectable =
      props.selectable === undefined ? false : props.selectable;
    console.info(`[info] update selectable: ${toSelectable}`);
    setSelectable(toSelectable);
  }, [props.selectable]);

  // -----------------------------------------------------------------------------
  // Section: 描画ステータス
  // -----------------------------------------------------------------------------
  useEffect(() => {
    if (!props.setUpdateStatus) return;
    console.info(`[info] update drawn: ${drawn}`);
    props.setUpdateStatus(drawn ? "drawn" : "pending");
  }, [drawn]);

  return null;
};

export default Controller;
