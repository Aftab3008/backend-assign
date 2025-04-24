import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../types/index.js";

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user", "provider"],
      default: "user",
    },
    imageUrl: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> = mongoose.model("User", UserSchema);
