import imageType, { minimumBytes } from "image-type";
import { readChunk } from "read-chunk";

export const selectRandom = (array: any[]) =>
  array[Math.floor(Math.random() * array.length)];

export const isImage = async (file_path: string) => {
  const buffer = await readChunk(file_path, { length: minimumBytes });
  const image_type = await imageType(buffer);
  const has_image_mime = image_type.mime?.startsWith("image");
  return has_image_mime;
};

export const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
