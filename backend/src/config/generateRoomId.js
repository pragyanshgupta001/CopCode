import { customAlphabet } from "nanoid";

const segment = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 4);

export const generateRoomId = () => {
  return `${segment()}-${segment()}-${segment()}`;
};