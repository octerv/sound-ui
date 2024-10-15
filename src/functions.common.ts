/**
 * 配列を指定された個数で分割する
 * @param array
 * @param number
 * @returns
 */
const sliceByNumber = (array: number[], number: number) => {
  const length = Math.ceil(array.length / number);
  return new Array(length)
    .fill(0)
    .map((_, i) => array.slice(i * number, (i + 1) * number));
};

/**
 * Base64エンコードされた文字列をArrayBufferに変換する関数です。
 * この関数は、Base64の文字列からデータ部分のみを抽出し、それをバイナリ形式の配列にデコードして、
 * 最終的にそのバイナリデータを格納したArrayBufferを返します。
 *
 * @param {string} base64 - Base64でエンコードされたデータを含む文字列。
 *                          通常は"data:image/png;base64,..."のような形式です。
 * @returns {ArrayBufferLike | null} - デコードされたデータを含むArrayBuffer、
 *                                     もしくは入力が無効な場合はnullを返します。
 *
 * 入力された文字列から、Base64エンコーディングのヘッダー部分（例："data:image/png;base64,"）を除去し、
 * 残りの文字列をデコードします。デコードされたバイナリデータはUint8Arrayに変換され、
 * そのバッファを返します。この過程で、無効なBase64文字列が与えられた場合はnullを返します。
 */
const base64ToArrayBuffer = (base64: string): ArrayBufferLike | null => {
  const idx = base64.indexOf(",");
  if (idx <= 0) return null;

  // "data:audio/mpeg;base64," を空文字に置換する（削除する）
  console.info(`[info]: ${base64.substring(0, idx)}`);
  const target = base64.substring(idx + 1);
  const binary_string = window.atob(target);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export { sliceByNumber, base64ToArrayBuffer };
