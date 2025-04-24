import { Response } from "express";
import mongoose from "mongoose";
import { Booking } from "../models/booking.model.js";
import { Service } from "../models/service.model.js";
import { RequestWithUserId } from "../types/index.js";

export const createBooking = async (req: RequestWithUserId, res: Response) => {
  try {
    const userId = req.userId;
    const { serviceId, date, time } = req.body;
    if (!serviceId) {
      res.status(400).json({ message: "Service is required" });
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      res.status(400).json({ message: "Invalid service ID" });
      return;
    }

    if (!date) {
      res.status(400).json({ message: "Date is required" });
      return;
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    if (!time) {
      res.status(400).json({ message: "Time is required" });
      return;
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }

    const providerId = service.provider.toString();
    const booking = await Booking.create({
      service: serviceId,
      user: userId,
      provider: providerId,
      date: parsedDate,
      time,
      totalPrice: service.price,
      notes: req.body.notes || "",
    });

    if (!booking) {
      res.status(500).json({ success: false, message: "Booking failed" });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookings = async (req: RequestWithUserId, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.role;

    let query;

    // Role-based filtering
    if (userRole === "user") {
      query = Booking.find({ user: userId });
    } else if (userRole === "provider") {
      query = Booking.find({ provider: userId });
    } else {
      query = Booking.find(); // admin gets all
    }

    // Populate service, user, and provider details
    query = query
      .populate({
        path: "service",
        select: "title description price",
      })
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "provider",
        select: "name email",
      });

    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookingById = async (req: RequestWithUserId, res: Response) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) {
      res
        .status(400)
        .json({ success: false, message: "Booking ID is required" });
      return;
    }

    const booking = await Booking.findById(req.params.id)
      .populate({
        path: "service",
        select: "title description price",
      })
      .populate({
        path: "user",
        select: "name email",
      })
      .populate({
        path: "provider",
        select: "name email",
      });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    if (
      booking.user._id.toString() !== req.userId &&
      booking.provider._id.toString() !== req.userId
    ) {
      res.status(403).json({ success: false, message: "Unauthorized access" });
      return;
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBooking = async (req: RequestWithUserId, res: Response) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) {
      res
        .status(400)
        .json({ success: false, message: "Booking ID is required" });
      return;
    }

    let booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    if (
      booking.user.toString() !== req.userId &&
      booking.provider.toString() !== req.userId &&
      req.role !== "admin"
    ) {
      res.status(403).json({ success: false, message: "Unauthorized access" });
      return;
    }

    if (req.body.status) {
      if (booking.provider.toString() !== req.userId && req.role !== "admin") {
        res
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
        return;
      }
    }

    booking = await Booking.findByIdAndUpdate(
      bookingId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBooking = async (req: RequestWithUserId, res: Response) => {
  try {
    const bookingId = req.params.id;
    if (!bookingId) {
      res
        .status(400)
        .json({ success: false, message: "Booking ID is required" });
      return;
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    if (booking.user.toString() !== req.userId && req.role !== "admin") {
      res.status(403).json({ success: false, message: "Unauthorized access" });
      return;
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
