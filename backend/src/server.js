import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import roomRoutes from "./routes/room.routes.js";
import authRoutes from "./routes/authRoutes.js";
import executeRoutes  from "./routes/execute.routes.js";   // NEW
import { initSocket } from "./socket/index.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin:      process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth",  authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/execute", executeRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "CopCode backend is running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ message: "Internal server error" });
});

const httpServer = http.createServer(app);
const io = initSocket(httpServer);
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

export { io };
