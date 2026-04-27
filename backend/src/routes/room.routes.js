import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createRoom,
  joinRoom,
  getRoom,
  getMyRooms,
} from "../controllers/room.controller.js";

import { exportRoom } from "../controllers/export.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createRoom);
router.post("/join", protectRoute, joinRoom);
router.get("/my-rooms", protectRoute, getMyRooms);
router.get("/:roomId/export", protectRoute, exportRoom);
router.get("/:roomId", protectRoute, getRoom);

export default router;