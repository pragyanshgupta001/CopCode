<<<<<<< HEAD
import Room from "../models/Room.model.js";
import User from "../models/User.js";
import { generateRoomId } from "../config/generateRoomId.js";


=======
import Room from "../models/room.model.js";
import User from "../models/User.js";
import { generateRoomId } from "../config/generateRoomId.js";

>>>>>>> a4a12d9 (full project implementation)
export const createRoom = async (req, res) => {
  try {
    const { name, language, maxMembers, description } = req.body;
    const userId = req.user._id;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "Room name must be at least 2 characters",
      });
    }

    if (name.trim().length > 60) {
      return res.status(400).json({
        message: "Room name cannot exceed 60 characters",
      });
    }

    let roomId;
    let isUnique = false;

    while (!isUnique) {
      roomId = generateRoomId();
      const existing = await Room.findOne({ roomId });
      if (!existing) isUnique = true;
    }

    const normalizedLanguage = (language || "javascript")
      .toLowerCase()
<<<<<<< HEAD
      .replace(/\+\+/, "pp")  // C++ → cpp
      .replace(/\s+/g, "");   // remove spaces
=======
      .replace(/\+\+/, "pp")
      .replace(/\s+/g, ""); 
>>>>>>> a4a12d9 (full project implementation)

    const allowedLanguages = [
      "javascript", "typescript", "python", "rust",
      "go", "java", "cpp", "ruby", "kotlin", "swift", "plaintext",
    ];

    const finalLanguage = allowedLanguages.includes(normalizedLanguage)
      ? normalizedLanguage
      : "javascript";

    const room = await Room.create({
      name: name.trim(),
      roomId,
      description: description?.trim() || "",
      language: finalLanguage,
      maxMembers: maxMembers || 8,
      owner: userId,

<<<<<<< HEAD
      // creator added as first member with role "owner"
=======
>>>>>>> a4a12d9 (full project implementation)
      members: [
        {
          user: userId,
          role: "owner",
          joinedAt: new Date(),
        },
      ],

      fileTree: [],
      activeFile: null,
      lastActivityAt: new Date(),
      isActive: true,
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        recentRooms: {
          $each: [room._id],
          $slice: -10,
        },
      },
    });

    const populatedRoom = await Room.findById(room._id)
      .populate("owner", "fullName email profilePic")
      .populate("members.user", "fullName email profilePic");

    return res.status(201).json({
      message: "Room created successfully",
      room: populatedRoom,
    });

  } catch (error) {
    console.error("createRoom error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    const userId = req.user._id;

    if (!roomId || !roomId.trim()) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    // find room
    const room = await Room.findOne({ roomId: roomId.trim() });

    if (!room) {
      return res.status(404).json({ message: "Room not found — check the ID and try again" });
    }

    if (!room.isActive) {
      return res.status(403).json({ message: "This room has been deleted" });
    }

    const alreadyMember = room.members.some(
      (m) => m.user.toString() === userId.toString()
    );

    if (!alreadyMember) {
      if (room.members.length >= room.maxMembers) {
        return res.status(403).json({
          message: `Room is full — maximum ${room.maxMembers} members allowed`,
        });
      }

<<<<<<< HEAD
      //add user as editor
=======
>>>>>>> a4a12d9 (full project implementation)
      room.members.push({
        user: userId,
        role: "editor",
        joinedAt: new Date(),
      });
    }

<<<<<<< HEAD
    //reset 7-day countdown on every join
    room.lastActivityAt = new Date();
    await room.save();

    //add to user recentRooms
=======
    room.lastActivityAt = new Date();
    await room.save();

>>>>>>> a4a12d9 (full project implementation)
    await User.findByIdAndUpdate(userId, {
      $push: {
        recentRooms: {
          $each: [room._id],
          $slice: -10,
        },
      },
    });

<<<<<<< HEAD
    // return populated room
=======
>>>>>>> a4a12d9 (full project implementation)
    const populatedRoom = await Room.findById(room._id)
      .populate("owner", "fullName email profilePic")
      .populate("members.user", "fullName email profilePic")
      .populate("onlineMembers", "fullName email profilePic");

    return res.status(200).json({
      message: alreadyMember ? "Rejoined room successfully" : "Joined room successfully",
      room: populatedRoom,
    });

  } catch (error) {
    console.error("joinRoom error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId, isActive: true })
      .populate("owner", "fullName email profilePic")
      .populate("members.user", "fullName email profilePic")
      .populate("onlineMembers", "fullName email profilePic");

    if (!room) {
      return res.status(404).json({
        message: "Room not found or has been deleted",
      });
    }

    return res.status(200).json({ room });

  } catch (error) {
    console.error("getRoom error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    const rooms = await Room.find({
      "members.user": userId,
      isActive: true,
    })
      .populate("owner", "fullName email profilePic")
      .populate("members.user", "fullName email profilePic")
      .sort({ lastActivityAt: -1 });

    return res.status(200).json({ rooms });

  } catch (error) {
    console.error("getMyRooms error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};