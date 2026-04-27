import mongoose from "mongoose";

const fileContentSchema = new mongoose.Schema(
  {
    roomId: {
<<<<<<< HEAD
      type: String,
      required: true,
      trim: true,
    },

    path: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
=======
      type:     String,
      required: true,
    },

    path: {
      type:     String,
      required: true,
      trim:     true,
    },

    content: {
      type:    String,
>>>>>>> a4a12d9 (full project implementation)
      default: "",
    },

    yjsState: {
<<<<<<< HEAD
      type: Buffer,
=======
      type:    Buffer,
>>>>>>> a4a12d9 (full project implementation)
      default: null,
    },

    lastEditedBy: {
<<<<<<< HEAD
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
=======
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
>>>>>>> a4a12d9 (full project implementation)
      default: null,
    },

    lastSavedAt: {
<<<<<<< HEAD
      type: Date,
=======
      type:    Date,
>>>>>>> a4a12d9 (full project implementation)
      default: null,
    },

    version: {
<<<<<<< HEAD
      type: Number,
=======
      type:    Number,
>>>>>>> a4a12d9 (full project implementation)
      default: 0,
    },
  },
  { timestamps: true }
);

fileContentSchema.index({ roomId: 1, path: 1 }, { unique: true });

fileContentSchema.index({ roomId: 1 });

const FileContent = mongoose.model("FileContent", fileContentSchema);
<<<<<<< HEAD

=======
>>>>>>> a4a12d9 (full project implementation)
export default FileContent;