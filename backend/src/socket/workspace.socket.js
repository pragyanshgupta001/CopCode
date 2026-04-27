import Workspace from "../models/workspace.model.js";
import Room from "../models/room.model.js";
import FileContent from "../models/file.content.model.js";
import Message from "../models/message.model.js";
import { evictYdocCache, getOrCreateYDoc } from "./editor.socket.js";
import * as Y from "yjs";

export const registerWorkspaceSocket = (io, socket) => {
  const user = socket.user;

  // workspace:load
  socket.on("workspace:load", async (roomId) => {
    try {
      if (!roomId) return;

      let ws = await Workspace.findOne({ roomId, owner: user._id });
      if (!ws) {
        ws = await Workspace.create({
          roomId, owner: user._id,
          files: [{ fileId: "ws-default", name: "scratch.js", language: "javascript", content: "// personal scratch pad\n" }],
        });
      }
      socket.emit("workspace:loaded", ws.files);
    } catch (err) {
      console.error("workspace:load:", err.message);
    }
  });

  // workspace:open-room-file
  socket.on("workspace:open-room-file", async ({ roomId, filePath, fileId }) => {
    try {
      if (!roomId || !filePath || !fileId) return;

      // Get content from Yjs doc (most up-to-date) or fall back to DB
      let content = "";
      try {
        const ydoc = await getOrCreateYDoc(roomId, filePath);
        content = ydoc.getText("content").toString();
      } catch {
        const fc = await FileContent.findOne({ roomId, path: filePath });
        content  = fc?.content || "";
      }

      const existingWorkspaceFile = await Workspace.findOneAndUpdate(
        { roomId, owner: user._id, "files.fileId": fileId },
        {
          $set: {
            "files.$.name": filePath.split("/").pop() || "untitled",
            "files.$.language": "plaintext",
            "files.$.content": content,
            "files.$.sourcePath": filePath,
            "files.$.updatedAt": new Date(),
          },
        }
      );

      if (!existingWorkspaceFile) {
        await Workspace.findOneAndUpdate(
          { roomId, owner: user._id },
          {
            $push: {
              files: {
                fileId,
                name: filePath.split("/").pop() || "untitled",
                language: "plaintext",
                content,
                sourcePath: filePath,
              },
            },
          },
          { upsert: true }
        );
      }

      socket.emit("workspace:room-file-content", { fileId, filePath, content });
    } catch (err) {
      console.error("workspace:open-room-file:", err.message);
    }
  });

  // workspace:update
  socket.on("workspace:update", async ({ roomId, fileId, content, sourcePath }) => {
    try {
      if (!roomId) return;
      if (fileId) {
        await Workspace.findOneAndUpdate(
          { roomId, owner: user._id, "files.fileId": fileId },
          { $set: { "files.$.content": content, "files.$.updatedAt": new Date() } }
        );
      }

      if (sourcePath && typeof content === "string") {
        await FileContent.findOneAndUpdate(
          { roomId, path: sourcePath },
          { $set: { content, lastEditedBy: user._id, lastSavedAt: new Date() } }
        );
      }

      socket.emit("workspace:saved", { fileId });
    } catch (err) {
      console.error("workspace:update:", err.message);
    }
  });

  // workspace:create-file
  socket.on("workspace:create-file", async ({ roomId, fileId, name, language }) => {
    try {
      if (!roomId || !name) return;

      const newFile = { fileId: fileId || `ws-${Date.now()}`, name, language: language || "plaintext", content: "" };

      await Workspace.findOneAndUpdate(
        { roomId, owner: user._id },
        { $push: { files: newFile } },
        { upsert: true }
      );

      socket.emit("workspace:file-created", newFile);
    } catch (err) {
      console.error("workspace:create-file:", err.message);
    }
  });

  // workspace:delete-file
  socket.on("workspace:delete-file", async ({ roomId, fileId }) => {
    try {
      if (!roomId || !fileId) return;

      await Workspace.findOneAndUpdate(
        { roomId, owner: user._id },
        { $pull: { files: { fileId } } }
      );

      socket.emit("workspace:file-deleted", { fileId });
    } catch (err) {
      console.error("workspace:delete-file:", err.message);
    }
  });

  // workspace:push
  socket.on("workspace:push", async ({ roomId, fileId, fileName, filePath, sourcePath, content: pushedContent }) => {
    try {
      if (!roomId) return;
      if (!fileId && !sourcePath && !filePath && !fileName) return;

      const ws = await Workspace.findOne({ roomId, owner: user._id });
      const file = ws?.files?.find((f) => f.fileId === fileId);

      let resolvedPath =
        sourcePath ||
        filePath ||
        file?.sourcePath ||
        (file?.name ? `/${file.name}` : null) ||
        (fileName ? `/${fileName}` : null);

      if (!resolvedPath && fileName) {
        const roomDoc = await Room.findOne({ roomId });
        const match = roomDoc?.fileTree?.find((n) => n.type === "file" && n.name === fileName);
        if (match?.path) resolvedPath = match.path;
      }

      if (!resolvedPath) return;

      let content = typeof pushedContent === "string" ? pushedContent : (file?.content || "");
      if (!content) {
        const existing = await FileContent.findOne({ roomId, path: resolvedPath });
        content = existing?.content || "";
      }

      await FileContent.findOneAndUpdate(
        { roomId, path: resolvedPath },
        { $setOnInsert: { content: "", yjsState: null } },
        { upsert: true }
      );

      evictYdocCache(roomId, resolvedPath);
      const ydoc  = await getOrCreateYDoc(roomId, resolvedPath);
      const ytext = ydoc.getText("content");

      Y.transact(ydoc, () => {
        const len = ytext.length;
        if (len > 0) ytext.delete(0, len);
        if (content) ytext.insert(0, content);
      }, "overwrite");

      const fullUpdate = Y.encodeStateAsUpdate(ydoc);
      await FileContent.findOneAndUpdate(
        { roomId, path: resolvedPath },
        {
          $set: {
            content,
            yjsState: Buffer.from(fullUpdate),
            lastEditedBy: user._id,
            lastSavedAt: new Date(),
          },
          $inc: { version: 1 },
        },
        { upsert: true }
      );

      io.to(roomId).emit("editor:overwrite", {
        filePath: resolvedPath,
        update: Array.from(fullUpdate),
      });
      io.to(roomId).emit("editor:file-pushed", {
        filePath: resolvedPath,
        fileName: file?.name || fileName || resolvedPath.split("/").pop(),
        content,
      });

      const room = await Room.findOne({ roomId });
      if (room) {
        const fileInTree = room.fileTree.find((n) => n.path === resolvedPath);
        if (!fileInTree) {
          room.fileTree.push({
            type: "file", name: file?.name || fileName || resolvedPath.split("/").pop(), path: resolvedPath,
            parentPath: null, language: file?.language || "plaintext",
            size: 0, createdBy: user._id, lastEditedBy: user._id,
          });
          room.lastActivityAt = new Date();
          await room.save();

          const savedRoom  = await Room.findOne({ roomId });
          const savedNode  = savedRoom.fileTree.find((n) => n.path === resolvedPath);
          io.to(roomId).emit("file:created", { node: savedNode });
        }
      }

    } catch (err) {
      console.error("workspace:push:", err.message);
    }
  });
};
