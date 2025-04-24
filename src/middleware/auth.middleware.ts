import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { RequestWithUserId } from "../types/index.js";

const secret_key = process.env.JWT_SECRET!;

if (!secret_key) {
  throw new Error("Secret key not found");
}

export const verifyToken = async (
  req: RequestWithUserId,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({
        message: "User unauthorized",
        success: false,
      });
      return;
    }
    const decode = jwt.verify(token, secret_key);

    if (!decode) {
      res.status(401).json({
        message: "Invalid token",
        success: false,
      });
      return;
    }

    req.userId = (decode as jwt.JwtPayload).userId;
    req.role = (decode as jwt.JwtPayload).role;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const verifyAdmin = async (
  req: RequestWithUserId,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = req.role;
    if (role !== "admin" && role !== "provider") {
      res.status(403).json({
        message: "Access denied",
        success: false,
      });
      return;
    }
    next();
  } catch (error) {
    console.error("Error verifying admin:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
