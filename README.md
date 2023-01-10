# SUI

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

## Preview

```
npm run preview
```

![View1](images/view1.png)
