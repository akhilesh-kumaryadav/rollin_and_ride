import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/auth.js";
import adminRoute from "./routes/adminRoute.js";
import vendorRoute from "./routes/venderRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { cloudinaryConfig } from "./utils/cloudinaryConfig.js";

const App = express();

App.use(express.json());
App.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connection Established to MongoDB Database.");
    App.listen(process.env.PORT, () => {
      console.log(`Rollin & Ride Server is Up and Listening!!! @ http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => console.error(error));

const allowedOrigins = [
  "https://rent-a-ride-two.vercel.app",
  `http://localhost:${process.env.PORT}`,
]; // Add allowed origins here

App.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    credentials: true, // Enables the Access-Control-Allow-Credentials header
  })
);

App.use("*", cloudinaryConfig);

// App.get('/*', (req, res) => res.sendFile(resolve(__dirname, '../public/index.html')));

App.use("/api/user", userRoute);
App.use("/api/auth", authRoute);
App.use("/api/admin", adminRoute);
App.use("/api/vendor", vendorRoute);

App.use((err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? "Internal Server Error";

  return res.status(statusCode).json({
    succes: false,
    message,
    statusCode,
  });
});
