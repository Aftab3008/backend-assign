import express from "express";
import { verifyAdmin, verifyToken } from "../middleware/auth.middleware.js";
import {
  createService,
  deleteService,
  getService,
  getServices,
  updateService,
} from "../controllers/service.controller.js";

const router = express.Router();

router.get("/get-services", getServices);
router.post("/create-service", verifyToken, verifyAdmin, createService);
router.get("/get-service/:id", getService);
router.put("/update-service/:id", verifyToken, verifyAdmin, updateService);
router.delete("/delete-service/:id", verifyToken, verifyAdmin, deleteService);

export default router;
