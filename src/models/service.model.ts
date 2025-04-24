import mongoose, { Schema } from "mongoose";
import { ServiceDocument } from "../types/index.js";

const serviceSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      enum: [
        "home",
        "health",
        "education",
        "beauty",
        "tech",
        "events",
        "automotive",
        "sports",
        "food",
        "travel",
        "fitness",
        "pets",
        "music",
        "art",
        "fashion",
        "photography",
        "wellness",
        "business",
        "finance",
        "real estate",
        "construction",
        "cleaning",
        "gardening",
        "transportation",
        "security",
        "other",
      ],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
    },
    duration: {
      type: Number,
      required: [true, "Please add a duration in minutes"],
    },
    availability: {
      days: {
        type: [String],
        required: [true, "Please select available days"],
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
      startTime: {
        type: String,
        required: [true, "Please add a start time"],
      },
      endTime: {
        type: String,
        required: [true, "Please add an end time"],
      },
    },
    image: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

serviceSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "service",
  justOne: false,
});

export const Service = mongoose.model<ServiceDocument>(
  "Service",
  serviceSchema
);
