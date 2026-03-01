import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
    console.log("MongoDB connected ✔");
  } catch (error) {
    console.log("Database connected error", error);
    process.exit(1);
  }
};

export default dbConnection;
