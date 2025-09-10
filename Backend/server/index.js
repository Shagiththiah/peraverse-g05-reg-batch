// Backend/server/index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import registrationRoutes from "../src/routes/registrationRoutes.js";
import adminRoutes from "../src/routes/adminRoutes.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Register visitor APIs
app.use("/api", registrationRoutes);

// Admin APIs
app.use("/admin", adminRoutes);

// Default
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://127.0.0.1:${PORT}`);
});
