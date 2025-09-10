// Backend/src/routes/adminRoutes.js
import express from "express";
import { 
  getVisitors, 
  getDashboardStats, 
  assignRfidTag, 
  deactivateRfidTag, 
  getAvailableRfidTags 
} from "../controllers/adminController.js";

const router = express.Router();

// Admin: get all registered visitors
router.get("/visitors", getVisitors);

// Admin: get dashboard statistics including RFID tags
router.get("/stats", getDashboardStats);

// Admin: get available RFID tags
router.get("/rfid/available", getAvailableRfidTags);

// Admin: assign RFID tag to registration
router.post("/rfid/assign", assignRfidTag);

// Admin: deactivate RFID tag
router.put("/rfid/:tagId/deactivate", deactivateRfidTag);

export default router;
