import { Request } from "express";
import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "provider";
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestWithUserId extends Request {
  userId?: string;
  role?: "user" | "admin" | "provider";
}

export interface BookingDocument extends Document {
  service: Types.ObjectId;
  user: Types.ObjectId;
  provider: Types.ObjectId;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  date: Date;
  time: string;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceDocument extends Document {
  title: string;
  description: string;
  provider: Types.ObjectId;
  category:
    | "home"
    | "health"
    | "education"
    | "beauty"
    | "tech"
    | "events"
    | "automotive"
    | "other";
  price: number;
  duration: number;
  availability: {
    days: (
      | "Monday"
      | "Tuesday"
      | "Wednesday"
      | "Thursday"
      | "Friday"
      | "Saturday"
      | "Sunday"
    )[];
    startTime: string;
    endTime: string;
  };
  image?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}
