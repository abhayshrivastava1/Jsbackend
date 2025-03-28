// import { Router } from 'express';
// import {registerUser} from '../controllers/user.controllers.js'

// const router = Router()

// router.route("/register").post(registerUser)

// export default router

import express from "express";
import { upload } from "../middlewares/multer.middleware.js"; // Import multer
import { registerUser } from "../controllers/user.controllers.js";
import { loginUser } from "../controllers/user.controllers.js";
import { logoutUser } from "../controllers/user.controllers.js";
import {
  refreshAccessToken,
  changeCurrentPassword,
  getCurrUser,
  accountUpdate,
  updateAvatar,
  updateCover,
  getUserChannel,
  getWatchHistory,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Use multer for file uploads
// router.route("/register").post(upload.fields([
//   { name: "avatar", maxCount: 1 },
//   { name: "coverImage", maxCount: 1 }
// ]), registerUser);

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
