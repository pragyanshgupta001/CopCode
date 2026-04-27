import express from "express";
<<<<<<< HEAD
import { login, logout, signup,updateProfile,checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();
router.post("/signup",signup)
router.post("/login",login);

router.post("/logout",logout);

router.put("/update-profile",protectRoute,updateProfile);
router.get("/check",protectRoute,checkAuth)
export default router;
=======
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  signup, login, logout, checkAuth,
  updateProfile, uploadProfilePic,
  changePassword,
  forgotPassword, resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/check", protectRoute, checkAuth);
router.put("/profile", protectRoute, updateProfile);
router.post("/profile/picture", protectRoute, uploadProfilePic);
router.put("/password", protectRoute, changePassword);

export default router;
>>>>>>> a4a12d9 (full project implementation)
