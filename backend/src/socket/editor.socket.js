import * as Y        from "yjs";
import FileContent   from "../models/file.content.model.js";
import Activity      from "../models/activity.model.js";
import Message       from "../models/message.model.js";
import Room          from "../models/room.model.js";

export const ydocCache  = new Map();
const saveTimers         = new Map();

function cacheKey(roomId, filePath) {
  return `${roomId}:${filePath}`;
}

function safeBuffer(value) {
  if (!value) return null;
  if (Buffer.isBuffer(value)) return value;
  if (value.type === "Buffer" && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }
  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }
  try { return Buffer.from(value); } catch { return null; }
}

export async function getOrCreateYDoc(roomId, filePath) {
  const key = cacheKey(roomId, filePath);
  if (ydocCache.has(key)) return ydocCache.get(key);

  const ydoc  = new Y.Doc();
  const saved = await FileContent.findOne({ roomId, path: filePath });

  if (saved?.yjsState) {
    const buf = safeBuffer(saved.yjsState);
    if (buf && buf.length > 0) {
      Y.applyUpdate(ydoc, new Uint8Array(buf));
    } else if (saved?.content) {
      ydoc.getText("content").insert(0, saved.content);
    }
  } else if (saved?.content) {
    ydoc.getText("content").insert(0, saved.content);
    await _saveYDocToDB(roomId, filePath, ydoc, null);
  }

  ydocCache.set(key, ydoc);
  return ydoc;
}

export function evictYdocCache(roomId, filePath) {
  const key  = cacheKey(roomId, filePath);
  const ydoc = ydocCache.get(key);
  if (ydoc) {
    try { ydoc.destroy(); } catch { /* ignore */ }
    ydocCache.delete(key);
  }
  const timer = saveTimers.get(key);
  if (timer) { clearTimeout(timer); saveTimers.delete(key); }
}

async function _saveYDocToDB(roomId, filePath, ydoc, userId) {
  try {
    const content  = ydoc.getText("content").toString();
    const yjsState = Buffer.from(Y.encodeStateAsUpdate(ydoc));

    await FileContent.findOneAndUpdate(
      { roomId, path: filePath },
      {
        $set: {
          content,
          yjsState,
          ...(userId ? { lastEditedBy: userId, lastSavedAt: new Date() } : {}),
        },
        $inc: { version: 1 },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error(`[saveYDoc] ${filePath}:`, err.message);
  }
}

function persistYDoc(roomId, filePath, ydoc, userId, instant = false) {
  const key = cacheKey(roomId, filePath);

  if (instant) {
    clearTimeout(saveTimers.get(key));
    saveTimers.delete(key);
    return _saveYDocToDB(roomId, filePath, ydoc, userId);
  }

  clearTimeout(saveTimers.get(key));
  saveTimers.set(
    key,
    setTimeout(() => _saveYDocToDB(roomId, filePath, ydoc, userId), 500)
  );
  return Promise.resolve();
}

export const registerEditorSocket = (io, socket) => {

  socket.on("editor:sync-step1", async ({ roomId, filePath, stateVector }) => {
    try {
      if (!roomId || !filePath) return;

      const ydoc = await getOrCreateYDoc(roomId, filePath);

      const clientSV = stateVector?.length
        ? new Uint8Array(stateVector)
        : new Uint8Array();

      const diff = Y.encodeStateAsUpdate(ydoc, clientSV);

      socket.emit("editor:sync-step1-reply", {
        filePath,
        update: Array.from(diff),
      });

      socket.emit("editor:sync-step2-request", {
        filePath,
        stateVector: Array.from(Y.encodeStateVector(ydoc)),
      });

      // Track presence
      socket.to(roomId).emit("editor:active-file", {
        userId:   socket.user._id,
        fullName: socket.user.fullName,
        filePath,
      });

    } catch (err) {
      console.error("editor:sync-step1:", err.message);
    }
  });

  socket.on("editor:sync-step2", async ({ roomId, filePath, update }) => {
    try {
      if (!roomId || !filePath || !update?.length) return;

      const ydoc = await getOrCreateYDoc(roomId, filePath);
      Y.applyUpdate(ydoc, new Uint8Array(update));
      persistYDoc(roomId, filePath, ydoc, socket.user._id);

    } catch (err) {
      console.error("editor:sync-step2:", err.message);
    }
  });

  socket.on("editor:update", async ({ roomId, filePath, update }) => {
    try {
      if (!roomId || !filePath || !update?.length) return;

      const ydoc = await getOrCreateYDoc(roomId, filePath);
      Y.applyUpdate(ydoc, new Uint8Array(update));

      socket.to(roomId).emit("editor:update", {
        filePath,
        update,
      });

      persistYDoc(roomId, filePath, ydoc, socket.user._id);

      io.to(roomId).emit("editor:activity", {
        filePath,
        userId:   socket.user._id,
        fullName: socket.user.fullName,
      });

    } catch (err) {
      console.error("editor:update:", err.message);
    }
  });

  socket.on("editor:overwrite", async ({ roomId, filePath, content }) => {
    try {
      if (!roomId || !filePath || content === undefined) return;

      const ydoc  = await getOrCreateYDoc(roomId, filePath);
      const ytext = ydoc.getText("content");

      Y.transact(ydoc, () => {
        const len = ytext.length;
        if (len > 0) ytext.delete(0, len);
        if (content)  ytext.insert(0, content);
      }, "overwrite");

      await persistYDoc(roomId, filePath, ydoc, socket.user._id, true);

      const fullUpdate = Y.encodeStateAsUpdate(ydoc);
      const snapshotText = ytext.toString();
      io.to(roomId).emit("editor:overwrite", {
        filePath,
        update: Array.from(fullUpdate),
        content: snapshotText,
      });

      const fileName = filePath.split("/").pop();
      await Activity.create({
        roomId, user: socket.user._id, action: "pushed", filePath, fileName,
      });

      const sysMsg = await Message.saveAndTrim({
        roomId, type: "system",
        text: `${socket.user.fullName} pushed ${fileName} to main editor`,
        sender: null,
      });
      io.to(roomId).emit("chat:message", sysMsg);
      await Room.findOneAndUpdate({ roomId }, { $set: { lastActivityAt: new Date() } });

    } catch (err) {
      console.error("editor:overwrite:", err.message);
    }
  });

  socket.on("editor:save", async ({ roomId, filePath }) => {
    try {
      if (!roomId || !filePath) return;

      const ydoc = ydocCache.get(cacheKey(roomId, filePath));
      if (!ydoc) return;

      await persistYDoc(roomId, filePath, ydoc, socket.user._id, true);

      const fileName = filePath.split("/").pop();
      await Activity.create({
        roomId, user: socket.user._id, action: "modified", filePath, fileName,
      });

      const sysMsg = await Message.saveAndTrim({
        roomId, type: "system",
        text: `${socket.user.fullName} modified ${fileName}`,
        sender: null,
      });
      io.to(roomId).emit("chat:message", sysMsg);
      await Room.findOneAndUpdate({ roomId }, { $set: { lastActivityAt: new Date() } });
      socket.emit("editor:saved", { filePath });

    } catch (err) {
      console.error("editor:save:", err.message);
    }
  });

  socket.on("editor:active-file", ({ roomId, filePath }) => {
    socket.to(roomId).emit("editor:active-file", {
      userId:   socket.user._id,
      fullName: socket.user.fullName,
      filePath,
    });
  });
};
