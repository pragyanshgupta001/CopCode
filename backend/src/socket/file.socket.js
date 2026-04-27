import Room        from "../models/room.model.js";
import FileContent from "../models/file.content.model.js";
import Activity    from "../models/activity.model.js";
import Message     from "../models/message.model.js";

export const registerFileSocket = (io, socket) => {

  // file:create
  socket.on("file:create", async ({ roomId, type, name, path, parentPath, language, content }) => {
    try {
      if (!roomId || !name || !path) return;

      const currentUser = socket.user;

      const room = await Room.findOne({ roomId, isActive: true });
      if (!room) return;

      // prevent duplicate paths
      const exists = room.fileTree.some((n) => n.path === path);
      if (exists) {
        socket.emit("file:error", { message: `${type === "folder" ? "Folder" : "File"} already exists at ${path}` });
        return;
      }

      const newNode = {
        type,
        name,
        path,
        parentPath:   parentPath || null,
        language:     language || "plaintext",
        size:         0,
        isExpanded:   type === "folder",
        createdBy:    currentUser._id,
        lastEditedBy: currentUser._id,
      };

      room.fileTree.push(newNode);
      room.lastActivityAt = new Date();
      await room.save();

      // save file content if provided
      if (type === "file" && content) {
        await FileContent.findOneAndUpdate(
          { roomId, path },
          { content, lastEditedBy: currentUser._id, lastSavedAt: new Date() },
          { upsert: true }
        );
      }

      await Activity.create({
        roomId,
        user:     currentUser._id,
        action:   "created",
        filePath: path,
        fileName: name,
      });

      const sysMsg = await Message.saveAndTrim({
        roomId,
        type:   "system",
        text:   `${currentUser.fullName} created ${type} ${name}`,
        sender: null,
      });

      const savedRoom = await Room.findOne({ roomId });
      const savedNode = savedRoom.fileTree.find((n) => n.path === path);

      io.to(roomId).emit("file:created", { node: savedNode, content: content || "" });
      io.to(roomId).emit("chat:message", sysMsg);

    } catch (err) {
      console.error("file:create error:", err.message);
      socket.emit("file:error", { message: "Failed to create file" });
    }
  });

  // file:delete
  socket.on("file:delete", async ({ roomId, path, type }) => {
    try {
      if (!roomId || !path) return;

      const currentUser = socket.user;

      const room = await Room.findOne({ roomId, isActive: true });
      if (!room) return;

      const node = room.fileTree.find((n) => n.path === path);
      if (!node) return;

      const fileName = node.name;

      const pathsToDelete = room.fileTree
        .filter((n) => n.path === path || n.path.startsWith(path + "/"))
        .map((n) => n.path);

      room.fileTree = room.fileTree.filter((n) => !pathsToDelete.includes(n.path));
      room.lastActivityAt = new Date();
      await room.save();

      await FileContent.deleteMany({ roomId, path: { $in: pathsToDelete } });

      await Activity.create({
        roomId,
        user:     currentUser._id,
        action:   "deleted",
        filePath: path,
        fileName,
      });

      const sysMsg = await Message.saveAndTrim({
        roomId,
        type:   "system",
        text:   `${currentUser.fullName} deleted ${type === "folder" ? "folder" : "file"} ${fileName}`,
        sender: null,
      });

      io.to(roomId).emit("file:deleted", { paths: pathsToDelete });
      io.to(roomId).emit("chat:message", sysMsg);

    } catch (err) {
      console.error("file:delete error:", err.message);
      socket.emit("file:error", { message: "Failed to delete file" });
    }
  });

  // file:rename
  socket.on("file:rename", async ({ roomId, oldPath, newPath, newName }) => {
    try {
      if (!roomId || !oldPath || !newPath || !newName) return;

      const currentUser = socket.user;

      const room = await Room.findOne({ roomId, isActive: true });
      if (!room) return;

      room.fileTree = room.fileTree.map((n) => {
        if (n.path === oldPath) return { ...n.toObject(), name: newName, path: newPath };
        if (n.path.startsWith(oldPath + "/")) {
          return {
            ...n.toObject(),
            path:       n.path.replace(oldPath, newPath),
            parentPath: n.parentPath?.replace(oldPath, newPath) || n.parentPath,
          };
        }
        return n;
      });

      room.lastActivityAt = new Date();
      await room.save();

      await FileContent.findOneAndUpdate({ roomId, path: oldPath }, { path: newPath });

      await Activity.create({
        roomId,
        user:     currentUser._id,
        action:   "renamed",
        filePath: newPath,
        fileName: newName,
      });

      const sysMsg = await Message.saveAndTrim({
        roomId,
        type:   "system",
        text:   `${currentUser.fullName} renamed to ${newName}`,
        sender: null,
      });

      io.to(roomId).emit("file:renamed", { oldPath, newPath, newName });
      io.to(roomId).emit("chat:message", sysMsg);

    } catch (err) {
      console.error("file:rename error:", err.message);
      socket.emit("file:error", { message: "Failed to rename file" });
    }
  });

  socket.on("file:move", async ({ roomId, oldPath, newParentPath, name }) => {
    try {
      if (!roomId || !oldPath || name === undefined) return;

      const currentUser = socket.user;

      const newPath = newParentPath ? `${newParentPath}/${name}` : `/${name}`;

      const room = await Room.findOne({ roomId, isActive: true });
      if (!room) return;

      const conflict = room.fileTree.find((n) => n.path === newPath && n.path !== oldPath);
      if (conflict) {
        socket.emit("file:error", { message: `A file named ${name} already exists there` });
        return;
      }

      room.fileTree = room.fileTree.map((n) => {
        if (n.path === oldPath) {
          return { ...n.toObject(), path: newPath, parentPath: newParentPath || null };
        }
        if (n.path.startsWith(oldPath + "/")) {
          return {
            ...n.toObject(),
            path:       n.path.replace(oldPath, newPath),
            parentPath: n.parentPath?.replace(oldPath, newPath) || n.parentPath,
          };
        }
        return n;
      });

      room.lastActivityAt = new Date();
      await room.save();

      // update FileContent path
      await FileContent.findOneAndUpdate({ roomId, path: oldPath }, { path: newPath });

      const sysMsg = await Message.saveAndTrim({
        roomId,
        type:   "system",
        text:   `${currentUser.fullName} moved ${name}`,
        sender: null,
      });

      // broadcast move to all room members
      io.to(roomId).emit("file:moved", { oldPath, newPath, newParentPath, name });
      io.to(roomId).emit("chat:message", sysMsg);

    } catch (err) {
      console.error("file:move error:", err.message);
      socket.emit("file:error", { message: "Failed to move file" });
    }
  });
};