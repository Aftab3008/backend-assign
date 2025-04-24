import express, { Request, Response } from "express";
import {
  getUser,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);

router.post("/signup", signup);

router.post("/logout", logout);

router.get("/getUser", verifyToken, getUser);

export default router;
