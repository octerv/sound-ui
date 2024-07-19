import { useEffect } from "react";
import { WavesProps } from "sound-ui/types";
import { useDataContext } from "../contexts/data";

const Controller = (props: WavesProps) => {
  const { setDataUrl, setAnnotations, setMono, setSelectable } =
    useDataContext();

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

  return null;
};

export default Controller;
