import mongoose from "mongoose";
import {  MONGODB_URL } from "../../config/variables.js";
import { createAdminUser } from "../../functions/admin/index.js";


export const connectDB = async () => {
  try {

    await mongoose.connect(MONGODB_URL);

    console.log("MongoDB connected successfully");

    await createAdminUser()
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

export const closeDB = async (signal) => {
  try {
    await mongoose.connection.close();
    console.log(`MongoDB connection closed due to ${signal}`);
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
};
