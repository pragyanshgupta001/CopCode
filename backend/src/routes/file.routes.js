import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import FileContent from "../models/file.content.model.js";

const router = express.Router();

// Get file content
router.get("/:roomId/:filePath", protectRoute, async (req, res) => {
  try {
    const file = await FileContent.findOne({
      roomId: req.params.roomId,
      filePath: decodeURIComponent(req.params.filePath),
    });
    res.json({ content: file?.content || "" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;