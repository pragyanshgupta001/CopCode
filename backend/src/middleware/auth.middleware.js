import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protectRoute = async (req,res,next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message: "Unauthorized - No Token Provided"})
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({message:"Unauthorized - Invalid token"});
        }
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        req.user = user ;
        next();

    } catch (error){
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({message:"Internal server error"});
    }
<<<<<<< HEAD
}
=======
}
export const verifySocketToken = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.cookie
        ?.split(";")
        .find((c) => c.trim().startsWith("token="))
        ?.split("=")[1];

    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
};
>>>>>>> a4a12d9 (full project implementation)
