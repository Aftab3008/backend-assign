import { Request, Response } from "express";
import validator from "validator";
import bcrypt from "bcryptjs";
import generateToken from "../utils/jwt.js";
import { User } from "../models/user.model.js";
import { RequestWithUserId } from "../types/index.js";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, imageUrl } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Name, email and password are all required." });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).json({ message: "Invalid email address." });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
      return;
    }

    const existing = await User.findOne({ email });

    if (existing) {
      res.status(409).json({ message: "Email already in use." });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      imageUrl: imageUrl,
    });

    const token = generateToken(res, user._id, user.email, user.role);

    res.status(201).json({
      message: "User created successfully",
      user: {
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    if (!validator.isEmail(email)) {
      res.status(400).json({ message: "Invalid email address." });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const token = generateToken(res, user._id, user.email, user.role);

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out successfully" });
  return;
};

export const getUser = async (
  req: RequestWithUserId,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "User unauthorized" });
      return;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User retrieved successfully",
      user: {
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
