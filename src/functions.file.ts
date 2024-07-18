import { ChangeEvent } from "react";

/**
 * ユーザーが選択したオーディオファイルを読み込み、そのデータURLを返却する非同期関数です。
 * ファイルの選択とファイルの読み込み処理を行い、成功時にはBase64形式のデータURLを返却します。
 * 読み込みが成功しないか、ファイルが選択されていない場合はnullを返却します。
 * また、読み込み中にエラーが発生した場合はPromiseが拒否され、エラー情報が返却されます。
 *
 * @param {ChangeEvent<HTMLInputElement>} e - ファイル選択イベントの情報が含まれるイベントオブジェクト。
 * @returns {Promise<string | null>} ファイルのデータURLを含むプロミス、またはnull。
 *                                  エラーが発生した場合はプロミスが拒否され、エラー情報が返されます。
 */
const openAudioFile = (
  e: ChangeEvent<HTMLInputElement>
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) {
      resolve(null); // ファイルがない場合はnullを返す
      return;
    }
    const file = files[0];
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        const dataUrl = reader.result.toString();
        resolve(dataUrl); // 成功時にdataUrlを返す
      } else {
        resolve(null); // 読み込み結果がない場合はnullを返す
      }
    };

    reader.onerror = () => {
      reject(reader.error); // エラーが発生した場合はエラーを返す
    };

    reader.readAsDataURL(file);
  });
};

/**
 * ユーザーが選択したJSONファイルを読み込み、その内容をJSONオブジェクトとして返す非同期関数です。
 * ファイルが選択されていない場合や、選択されたファイルの読み込みに失敗した場合はnullを返します。
 * ファイルリーダーを使用してファイルをテキストとして読み込み、その後JSONとしてパースします。
 *
 * @param {ChangeEvent<HTMLInputElement>} e - ファイル選択イベントの情報を含むイベントオブジェクト。
 *                                            ユーザーがファイル入力を通じて選択したファイルへのアクセスを提供します。
 * @returns {Promise<any | null>} JSONとしてパースされたデータを含むPromise、またはエラー発生時やファイルがない場合はnull。
 *
 * ファイルの選択が確認された後、FileReaderを使ってファイルを読み込みます。読み込みが完了すると、
 * onLoadイベントが発火し、読み込まれたデータを文字列として取得後、JSON.parseを使ってオブジェクトに変換します。
 * 変換されたJSONデータはPromiseを通じて返されます。ファイルの読み込みに失敗した場合や、
 * ファイルの内容が空の場合にはnullが返されます。
 */
const openJsonFile = (
  e: ChangeEvent<HTMLInputElement>
): Promise<any | null> => {
  return new Promise((resolve, reject) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) {
      resolve(null); // ファイルがない場合はnullを返す
      return;
    }
    const file = files[0];
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result) {
        const jsonData = JSON.parse(reader.result.toString());
        resolve(jsonData);
      } else {
        resolve(null);
      }
    };
    reader.readAsText(file);
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
// Export
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
export { openAudioFile, openJsonFile };
