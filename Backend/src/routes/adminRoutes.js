// Backend/src/routes/adminRoutes.js
import express from "express";
import { getVisitors } from "../controllers/adminController.js";

const router = express.Router();

// Admin: get all registered visitors
router.get("/visitors", getVisitors);

export default router;
