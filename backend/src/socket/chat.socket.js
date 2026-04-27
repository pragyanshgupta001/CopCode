import Message from "../models/message.model.js";
import Room from "../models/room.model.js";

export const registerChatSocket = (io, socket) => {
  const user = socket.user;

  socket.on("chat:history", async (roomId) => {
    try {
      if (!roomId) return;

      const messages = await Message.find({ roomId })
        .populate("sender", "fullName profilePic")
        .sort({ createdAt: 1 })
        .limit(50);

      socket.emit("chat:history", messages);

    } catch (err) {
      console.error("chat:history error:", err.message);
    }
  });

  socket.on("chat:send", async ({ roomId, text }) => {
    try {
      if (!roomId || !text?.trim()) return;

      // enforce max length
      const truncated = text.trim().slice(0, 2000);

      // save message (enforces 50 message limit)
      const msg = await Message.saveAndTrim({
        roomId,
        type:   "text",
        sender: user._id,
        text:   truncated,
      });

      // update room lastActivityAt
      await Room.findOneAndUpdate(
        { roomId },
        { lastActivityAt: new Date() }
      );

      io.to(roomId).emit("chat:message", msg);

    } catch (err) {
      console.error("chat:send error:", err.message);
    }
  });

  socket.on("chat:typing", (roomId) => {
    socket.to(roomId).emit("chat:typing", {
      userId:   user._id,
      fullName: user.fullName,
    });
  });

  socket.on("chat:stop-typing", (roomId) => {
    socket.to(roomId).emit("chat:stop-typing", {
      userId: user._id,
    });
  });
};