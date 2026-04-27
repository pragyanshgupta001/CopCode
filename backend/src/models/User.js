<<<<<<< HEAD
import mongoose from "mongoose"
const userSchema = new mongoose.Schema(
    {
       email:{
        type: String,
        required: true,
        unique:true,
       } ,
       fullName:{
        type: String,
        required: true,
       },
       password:{
        type: String,
        required: true,
        minlength: 6,
       },
       profilePic:{
        type: String,
        default: "",
       }
    },
    {timestamps: true}
);
const User = mongoose.model("User", userSchema);
export default User;
=======
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    profilePic: {
      type: String,
      default: "",
    },

    dob: {
      type: Date,
      default: null,
    },

    education: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    recentRooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
>>>>>>> a4a12d9 (full project implementation)
