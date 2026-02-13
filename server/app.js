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

const app = express();

app.use(
  cors({
    origin: [`http://localhost:${process.env.PORT}`],
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("*", cloudinaryConfig);

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/vendor", vendorRoute);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message ?? "Something went wrong.",
    statusCode,
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connection Established to MongoDB Database.");

    app.listen(process.env.PORT, () => {
      console.log(
        `Rollin & Ride Server is Up and Listening!!! @port :${process.env.PORT}`,
      );
    });
  })
  .catch((error) => {
    console.log("Database connection failed.");
    console.error(error);
  });
