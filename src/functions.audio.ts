/**
 * 指定された時間範囲に基づいてAudioBufferを切り取り、新しいAudioBufferを生成します。
 *
 * @param audioBuffer - 切り取り元のAudioBuffer。
 * @param startTime - 切り取り開始時間（秒単位）。
 * @param endTime - 切り取り終了時間（秒単位）。この時間は含まれません。
 *
 * @returns 新しいAudioBuffer。このバッファは、指定された開始時間と終了時間の間のオーディオデータを含みます。
 *
 * この関数では、与えられたaudioBufferから、startTimeとendTimeで指定された区間のサンプルを新しいAudioBufferにコピーします。
 * 処理は以下のステップで行われます：
 * 1. 開始時刻と終了時刻から対応するサンプルインデックスを計算。
 * 2. 新しいAudioBufferを生成（チャンネル数とサンプルレートは元のAudioBufferと同じ）。
 * 3. 元のAudioBufferから新しいAudioBufferへチャンネルデータをコピー。
 *
 * 注意：この関数を使用するにはAudioContextのインスタンスが必要です。この関数内で新しいAudioContextを生成していますが、
 * 実際のアプリケーションでは既存のコンテキストを再利用する方が効率的かもしれません。
 */
const sliceAudioBuffer = (
  audioBuffer: AudioBuffer,
  startTime: number,
  endTime: number
): AudioBuffer => {
  const sampleRate = audioBuffer.sampleRate;
  const startSample = Math.floor(startTime * sampleRate);
  const endSample = Math.min(
    Math.ceil(endTime * sampleRate),
    audioBuffer.length
  );
  const newBufferLength = endSample - startSample;

  const audioContext = new AudioContext();
  const newAudioBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    newBufferLength,
    sampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    const newChannelData = newAudioBuffer.getChannelData(channel);

    for (let i = startSample, j = 0; i < endSample; i++, j++) {
      newChannelData[j] = channelData[i];
    }
  }

  return newAudioBuffer;
};

/**
 * 与えられたAudioBuffer内の全チャンネルを通じて、最大の絶対オーディオサンプル値を取得します。
 *
 * @param audioBuffer - 最大値を検索するAudioBufferオブジェクト。
 * @returns 最大の絶対値を返します。この値は、オーディオの振幅のピークを示します。
 *
 * この関数は以下のプロセスで動作します：
 * 1. 最大値を保持する変数 `max` を0で初期化。
 * 2. AudioBufferの各チャンネルに対してループを行い、
 * 3. 各チャンネルのサンプルデータに対して、現在の最大値と比較し、より大きい絶対値が見つかった場合はそれを新しい最大値として更新。
 *
 * 注意：この関数は、単一チャンネルのピークではなく、提供された全チャンネルの中での最大振幅を検出します。
 *       パフォーマンスの観点からは、大規模なオーディオバッファを扱う場合には計算コストが高くなる可能性があります。
 */
const getMaxValues = (
  audioBuffer: AudioBuffer
): { [index: number]: number } => {
  let max: { [index: number]: number } = {};
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const value = audioBuffer.getChannelData(i).reduce((a, b) => {
      const aa: number = a < 0 ? -a : a;
      const bb: number = b < 0 ? -b : b;
      // console.debug(`${a} -> ${aa}, ${b} -> ${bb}`);
      return Math.max(aa, bb);
      // return Math.max(a, b);
    }, 0);
    max[i] = value;
  }
  return max;
};

/**
 * 与えられたAudioBuffer内で、指定された時間長にわたって最大の振幅合計を持つ区間の開始と終了時間を返します。
 * この関数は、オーディオデータ内の最も活動的な部分を特定するのに役立ちます（例えば、最も大きな音が含まれる部分など）。
 *
 * @param audioBuffer - 解析対象のAudioBuffer。
 * @param length - 解析する区間の長さ（秒）。
 * @returns 最大振幅合計を持つ区間の開始と終了時間の配列。時間は秒単位で、小数点以下3桁までの精度で返されます。
 *
 * 処理の流れ:
 * 1. 入力されたAudioBufferからサンプルレートを取得します。
 * 2. 0.1秒ごとにサンプルを取り、各チャンネルの値の絶対値を加算していきます。
 * 3. 指定された `length` に応じて、古いサンプルを合計値から引き、新しいサンプルを加えていくスライディングウィンドウ法を使用します。
 * 4. 各ステップで合計値がこれまでの最大値を超えた場合、その時点のインデックスを保存します。
 * 5. 最終的に最大振幅を持つ区間の開始と終了インデックスをサンプルレートに基づいて時間に変換し、返します。
 *
 * 注意点：
 * - この関数は大きなAudioBufferに対して高い計算コストを要する可能性があります。
 * - 入力されたAudioBufferが非常に短い場合、指定された`length`に十分なデータが存在しない場合があります。
 */
const getMaxArea = (audioBuffer: AudioBuffer, length: number): number[] => {
  const areaIdx = [0, 0];
  const sampleRate = audioBuffer.sampleRate;
  console.debug(`sampleRate: ${sampleRate}`);
  const stepInterval = audioBuffer.sampleRate * 0.1;
  let maxSum = 0;
  let sum = 0;
  // 全てのデータを確認する
  for (let i = 0; i < audioBuffer.length; i = i + stepInterval) {
    // 各チャンネル毎に加算する
    for (let j = 0; j < audioBuffer.numberOfChannels; j++) {
      sum += Math.abs(audioBuffer.getChannelData(j)[i]);
      // lengthの秒数を超えている場合は加算範囲をずらす
      if (i - sampleRate * length > 0) {
        const beforeIdx = i - sampleRate * length;
        sum -= Math.abs(audioBuffer.getChannelData(j)[beforeIdx]);
      }
    }
    // 加算結果が最大を超えているかどうか
    if (maxSum < sum) {
      maxSum = sum;
      areaIdx[1] = i;
      if (i - sampleRate * length > 0) {
        areaIdx[0] = i - sampleRate * length;
      }
    }
  }
  return [
    Math.round((areaIdx[0] / sampleRate) * 1000) / 1000,
    Math.round((areaIdx[1] / sampleRate) * 1000) / 1000,
  ];
};

/**
 * 提供されたAudioBuffer内の全サンプルを指定された最大値で正規化します。
 * 正規化は、各サンプル値を最大値で割ることにより行われ、結果として得られる値は -1.0 から 1.0 の範囲に収まります。
 *
 * @param audioBuffer - 正規化を行うAudioBufferオブジェクト。
 * @param maxValue - 正規化に使用する最大値。この値によって全てのサンプル値が割り算されます。
 * @returns 正規化されたAudioBufferを返します。
 *
 * この関数は次のプロセスを実行します：
 * 1. AudioBufferの各チャンネルをループ処理。
 * 2. 各チャンネルのサンプルデータに対してループを行い、
 * 3. 各サンプルをmaxValueで割り、その結果を元のサンプルデータに上書き保存。
 *
 * 注意：この関数は元のAudioBufferを変更します。新しいBufferが必要な場合は、関数を呼び出す前にコピーを作成してください。
 * また、maxValueが0の場合には除算エラーが発生するため、呼び出し側で適切な値のチェックが必要です。
 */
const normalizeValue = (
  audioBuffer: AudioBuffer,
  maxValue: number
): AudioBuffer => {
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    const channelData = audioBuffer.getChannelData(i);
    for (let j = 0; j < channelData.length; j++) {
      channelData[j] = channelData[j] / maxValue;
    }
  }
  return audioBuffer;
};

/**
 * 指定された周波数、持続時間、および音量で単一の正弦波を含むAudioBufferを生成します。
 * 生成される音声バッファはモノラルです。
 *
 * @param audioContext - AudioBufferを生成するのに使用するAudioContext。
 * @param duration - 正弦波の持続時間（秒単位）。
 * @param frequency - 正弦波の周波数（ヘルツ単位）。
 * @param volume - 正弦波の最大振幅（-1から1の範囲で指定）。
 * @returns 生成されたAudioBuffer。このバッファは、指定されたパラメータに基づいた正弦波データを含んでいます。
 *
 * 処理の流れ:
 * 1. 指定されたサンプルレートに基づいて必要なサンプル数を計算します。
 * 2. 計算されたサンプル数で新しいAudioBufferを生成します。
 * 3. バッファの各サンプルに対して、指定された周波数と音量で正弦波の値を計算し、それをバッファに書き込みます。
 *
 * 注意：この関数は音量を -1 から 1 の範囲で受け取りますが、実際の音声出力デバイスや再生環境によって聞こえる音量は異なる場合があります。
 * また、非常に高い周波数を指定した場合、サンプルレートによっては正確に波形を再現できないことがあります。
 */
const createAudioBuffer = (
  audioContext: AudioContext,
  duration: number,
  frequency: number,
  volume: number
): AudioBuffer => {
  // 音声バッファのパラメーター
  const sampleRate = audioContext.sampleRate;

  // サンプル数とチャンネル数の計算
  const numSamples = Math.floor(duration * sampleRate);

  // 音声バッファの作成
  const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);

  // バッファへの書き込み
  const channelData = audioBuffer.getChannelData(0); // モノラルの場合、チャンネル0を使用

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate; // 時間（秒）の計算
    const value = volume * Math.sin(2 * Math.PI * frequency * t); // 正弦波の値の計算

    // -1から1の範囲に正規化して格納
    channelData[i] = value;
  }

  return audioBuffer;
};

/**
 * 複数のAudioBufferを合成し、一つのAudioBufferにまとめます。合成されたBufferは、必要に応じて正規化されます。
 * 各Bufferの第一チャンネルからのサンプル値が合算され、新しい単一チャンネルAudioBufferが生成されます。
 *
 * @param audioContext - AudioBufferを生成するために使用するAudioContext。
 * @param buffers - 合成するAudioBufferの配列。全てのBufferは同じ長さである必要があります。
 * @returns 合成および正規化された新しいAudioBufferを返します。
 *
 * 処理の流れ:
 * 1. 同じサンプルレートと最初のBufferと同じ長さを持つ新しいAudioBufferを生成します。
 * 2. 新しいBufferの全サンプルに対して、与えられた各Bufferの同じインデックスのサンプル値を合算します。
 * 3. 合成後のBufferの最大振幅が1を超える場合、正規化を行い、全てのサンプル値を最大振幅で割ります。
 *
 * 注意：この関数は、全ての入力Bufferが同じ長さであることを前提としています。異なる長さのBufferが提供された場合の動作は未定義です。
 * また、最大値が1を超えた場合のみ正規化が行われ、元のAudioBufferは変更されません（新しいBufferが返されます）。
 */
const synthesisWaves = (
  audioContext: AudioContext,
  buffers: AudioBuffer[]
): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  let audioBuffer = audioContext.createBuffer(1, buffers[0].length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < buffers[0].length; i++) {
    let value = 0;
    for (let j = 0; j < buffers.length; j++) {
      const data = buffers[j].getChannelData(0);
      value += data[i];
    }
    channelData[i] = value;
  }
  const maxValues = getMaxValues(audioBuffer);
  const max = Math.max(...Object.values(maxValues));
  if (max > 1) {
    audioBuffer = normalizeValue(audioBuffer, max);
  }
  return audioBuffer;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export {
  sliceAudioBuffer,
  getMaxValues,
  getMaxArea,
  normalizeValue,
  createAudioBuffer,
  synthesisWaves,
};
