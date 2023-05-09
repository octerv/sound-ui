# Sound UI

Sound UI Components with React.

## Usage

### Waves

Display waves from audio file.

```
import { Waves } from "sound-ui";

export const Default = () => {
  const [dataUrl, setDataUrl] = useState("");
  const [normalize, setNormalize] = useState(false);

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files?.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        if (reader.result) {
          setDataUrl(reader.result.toString());
        }
      },
      false
    );
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleNormalize = () => {
    setNormalize(!normalize);
  };

  return (
    <>
      <input type="file" accept="audio/*" onChange={selectFile} />
      <button onClick={handleNormalize}>
        Normalize ({normalize ? "ON" : "OFF"})
      </button>
      <br />
      <Waves
        dataUrl={dataUrl}
        width={800}
        height={400}
        samplingLevel={0.01}
        normalize={normalize}
        selectable
      />
    </>
  );
};
```

#### Parameters

- dataUrl(require:string): set Data URL (start at "data:audio/mpeg;base64,...")
- width(require:number): set Component width
- height(require:number): set Component height
- samplingLevel(optional:number): detail of waves (max:0.001, othre:0.01 0.1 1)
- normalize(optional:boolean): set true to normalize waves
- selectable(optional:boolean): set true to select range on waves
- stereo(optional:boolean): set true, mixing two stereo waveforms into a single waveform
- maxAreaLength(optional:number): Specify the duration in seconds for which the addition of sound over a certain period of time is maximal
- setMaxArea(optinal:(area: number[])=>void): return Maximum section, array 0 is start second, array 1 is end second

## Preview

```
npm run preview
```

![View1](https://user-images.githubusercontent.com/103025781/211580349-fc17c7eb-d4e2-42e2-a78b-b0ed19369657.png)
