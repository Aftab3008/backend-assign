import { Response } from "express";
import { Service } from "../models/service.model.js";
import { RequestWithUserId } from "../types/index.js";

export const createService = async (req: RequestWithUserId, res: Response) => {
  try {
    const { title, description, category, price, duration, availability } =
      req.body;

    if (!title || title.trim() === "") {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    if (!description || description.trim() === "") {
      res.status(400).json({ message: "Description is required" });
      return;
    }

    if (!category || category.trim() === "") {
      res.status(400).json({ message: "Category is required" });
      return;
    }

    if (typeof price !== "number" || price < 0) {
      res.status(400).json({ message: "Price must be a positive number" });
      return;
    }

    if (typeof duration !== "number" || duration < 1) {
      res.status(400).json({ message: "Duration must be a positive number" });
      return;
    }

    if (!availability || typeof availability !== "object") {
      res.status(400).json({ message: "Availability is required" });
      return;
    }

    const { days, startTime, endTime } = availability;

    if (!Array.isArray(days) || days.length === 0) {
      res.status(400).json({ message: "Days are required" });
      return;
    }

    if (!startTime || startTime.trim() === "") {
      res.status(400).json({ message: "Start time is required" });
      return;
    }

    if (!endTime || endTime.trim() === "") {
      res.status(400).json({ message: "End time is required" });
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      res.status(400).json({ message: "End time must be after start time" });
      return;
    }

    const service = await Service.create({
      title,
      description,
      category,
      price,
      duration,
      availability,
      provider: req.userId,
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getServices = async (
  req: RequestWithUserId,
  res: Response
): Promise<void> => {
  try {
    const reqQuery = { ...req.query } as Record<string, any>;
    ["select", "sort", "page", "limit"].forEach((f) => delete reqQuery[f]);

    let qs = JSON.stringify(reqQuery);
    qs = qs.replace(/\b(gt|gte|lt|lte|in)\b/g, (m) => `$${m}`);
    const filter = JSON.parse(qs, (k, v) =>
      typeof v === "string" && /^\d+(\.\d+)?$/.test(v) ? Number(v) : v
    );

    const projection = req.query.select
      ? (req.query.select as string).split(",").join(" ")
      : "";
    const sortBy = req.query.sort
      ? (req.query.sort as string).split(",").join(" ")
      : "-createdAt";

    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.max(
      1,
      parseInt((req.query.limit as string) || "10", 10)
    );
    const skip = (page - 1) * limit;

    const services = await Service.find(filter, projection, {
      sort: sortBy,
      skip,
      limit,
    }).populate("provider", "name email");

    const pagination: Record<string, { page: number; limit: number }> = {};
    if (services.length === limit) {
      pagination.next = { page: page + 1, limit };
    }
    if (page > 1) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: services.length,
      pagination,
      data: services,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getService = async (req: RequestWithUserId, res: Response) => {
  try {
    const serviceId = req.params.id;

    if (!serviceId) {
      res.status(400).json({ message: "Service ID is required" });
      return;
    }

    const service = await Service.findById(serviceId).populate(
      "provider",
      "name email"
    );

    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateService = async (req: RequestWithUserId, res: Response) => {
  try {
    const serviceId = req.params.id;
    const { title, description, category, price, duration, availability } =
      req.body;

    if (!serviceId) {
      res.status(400).json({ message: "Service ID is required" });
      return;
    }

    if (!title || title.trim() === "") {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    if (!description || description.trim() === "") {
      res.status(400).json({ message: "Description is required" });
      return;
    }

    if (!category || category.trim() === "") {
      res.status(400).json({ message: "Category is required" });
      return;
    }

    if (typeof price !== "number" || price < 0) {
      res.status(400).json({ message: "Price must be a positive number" });
      return;
    }

    if (typeof duration !== "number" || duration < 1) {
      res.status(400).json({ message: "Duration must be a positive number" });
      return;
    }

    if (!availability || typeof availability !== "object") {
      res.status(400).json({ message: "Availability is required" });
      return;
    }

    const { days, startTime, endTime } = availability;

    if (!Array.isArray(days) || days.length === 0) {
      res.status(400).json({ message: "Days are required" });
      return;
    }

    if (!startTime || startTime.trim() === "") {
      res.status(400).json({ message: "Start time is required" });
      return;
    }

    if (!endTime || endTime.trim() === "") {
      res.status(400).json({ message: "End time is required" });
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      res.status(400).json({ message: "End time must be after start time" });
      return;
    }

    let service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({ success: false, message: "Service not found" });
      return;
    }

    if (service.provider.toString() !== req.userId && req.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Not authorized to update this service",
      });
      return;
    }

    service = await Service.findByIdAndUpdate(
      serviceId,
      {
        title,
        description,
        category,
        price,
        duration,
        availability,
        provider: req.userId,
      },
      { new: true, runValidators: true }
    ).populate("provider", "name email");

    if (!service) {
      res
        .status(404)
        .json({ message: "Service not found or you are not authorized" });
      return;
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteService = async (req: RequestWithUserId, res: Response) => {
  try {
    const serviceId = req.params.id;

    if (!serviceId) {
      res.status(400).json({ message: "Service ID is required" });
      return;
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    if (service.provider.toString() !== req.userId && req.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Not authorized to delete this service",
      });
      return;
    }

    await Service.findByIdAndDelete(serviceId);

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
