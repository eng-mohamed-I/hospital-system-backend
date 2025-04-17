import mongoose from "mongoose";
// =============================
const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("DB Connected Successfully...");
  } catch (err) {
    console.log("DB Connection Failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
