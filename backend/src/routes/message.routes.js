import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import Message from "../models/message.model.js";

const router = express.Router();

router.get("/:roomId", protectRoute, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ createdAt: 1 })
      .limit(50);
    res.json({ messages });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;