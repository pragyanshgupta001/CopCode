import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { executeCode, getLanguages } from "../controllers/execute.controller.js";

const router = express.Router();

router.post("/", protectRoute, executeCode);

router.get("/languages", protectRoute, getLanguages);

export default router;