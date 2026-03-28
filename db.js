import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://admin:1234@cluster0.fdeqdoh.mongodb.net/?appName=Cluster0"
  );

  console.log("🟢 MongoDB Atlas connected");
};