<<<<<<< HEAD
import { nanoid } from "nanoid";

export const generateRoomId = () => {
  const seg = () => nanoid(4).toLowerCase();
  return `${seg()}-${seg()}-${seg()}`;
=======
import { customAlphabet } from "nanoid";

const segment = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 4);

export const generateRoomId = () => {
  return `${segment()}-${segment()}-${segment()}`;
>>>>>>> a4a12d9 (full project implementation)
};