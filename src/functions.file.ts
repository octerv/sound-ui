import { ChangeEvent } from "react";

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
