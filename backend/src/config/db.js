import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
<<<<<<< HEAD
    console.log(`MongoDB Connected ✅`);
=======
    console.log(`MongoDB Connected `);
>>>>>>> a4a12d9 (full project implementation)
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;