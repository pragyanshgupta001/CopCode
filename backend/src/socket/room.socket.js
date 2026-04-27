import Room    from "../models/room.model.js";
import Message from "../models/message.model.js";

export const registerRoomSocket = (io, socket) => {

  // join-room
  socket.on("join-room", async (roomId) => {
    try {
      if (!roomId) return;
      const currentUser = socket.user;

      if (socket.currentRoomId && socket.currentRoomId !== roomId) {
        await handleLeave(io, socket, socket.currentRoomId, currentUser);
      }

      const room = await Room.findOne({ roomId, isActive: true });
      if (!room) { socket.emit("error", { message: "Room not found" }); return; }

      const isMember = room.members.some(
        (m) => m.user.toString() === currentUser._id.toString()
      );
      if (!isMember) { socket.emit("error", { message: "Not a member" }); return; }

      socket.join(roomId);
      socket.currentRoomId = roomId;

      await Room.findOneAndUpdate(
        { roomId },
        { $addToSet: { onlineMembers: currentUser._id }, $set: { lastActivityAt: new Date() } }
      );

      const sysMsg = await Message.saveAndTrim({
        roomId, type: "system",
        text:   `${currentUser.fullName} joined the room`,
        sender: null,
      });
      io.to(roomId).emit("chat:message", sysMsg);

      const updated = await Room.findOne({ roomId })
        .populate("onlineMembers", "fullName profilePic _id");
      io.to(roomId).emit("online-members", updated.onlineMembers);

      socket.to(roomId).emit("user-joined", {
        _id:        currentUser._id,
        fullName:   currentUser.fullName,
        profilePic: currentUser.profilePic,
      });

    } catch (err) {
      console.error("join-room:", err.message);
    }
  });

  // leave-room
  socket.on("leave-room", async (roomId) => {
    try { await handleLeave(io, socket, roomId, socket.user); }
    catch (err) { console.error("leave-room:", err.message); }
  });

  // disconnect
  socket.on("disconnect", async () => {
    try {
      if (socket.currentRoomId) {
        await handleLeave(io, socket, socket.currentRoomId, socket.user);
      }
    } catch (err) {
      console.error("disconnect:", err.message);
    }
  });

  socket.on("user:updated", ({ userId, fullName, profilePic }) => {
    if (!userId) return;
    if (socket.currentRoomId) {
      socket.to(socket.currentRoomId).emit("user:updated", {
        userId,
        fullName,
        profilePic,
      });
    }
  });
};

async function handleLeave(io, socket, roomId, currentUser) {
  if (!roomId || !currentUser?._id) return;

  const room = await Room.findOne({ roomId });
  if (!room) return;

  socket.leave(roomId);
  socket.currentRoomId = null;

  await Room.findOneAndUpdate(
    { roomId },
    { $pull: { onlineMembers: currentUser._id } }
  );

  const sysMsg = await Message.saveAndTrim({
    roomId, type: "system",
    text:   `${currentUser.fullName} left the room`,
    sender: null,
  });
  io.to(roomId).emit("chat:message", sysMsg);

  const updated = await Room.findOne({ roomId })
    .populate("onlineMembers", "fullName profilePic _id");
  if (updated) {
    io.to(roomId).emit("online-members", updated.onlineMembers || []);
  }
}
