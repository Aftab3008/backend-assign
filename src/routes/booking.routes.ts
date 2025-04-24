import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  createBooking,
  deleteBooking,
  getBookingById,
  getBookings,
  updateBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.get("/get-bookings", verifyToken, getBookings);
router.post("/create-booking", verifyToken, createBooking);
router.get("/get-booking/:id", verifyToken, getBookingById);
router.put("/update-booking/:id", verifyToken, updateBooking);
router.delete("/delete-booking/:id", verifyToken, deleteBooking);

export default router;
