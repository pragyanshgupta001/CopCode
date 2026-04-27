import mongoose from "mongoose";

const fileContentSchema = new mongoose.Schema(
  {
    roomId: {
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
      default: "",
    },

    yjsState: {
      type:    Buffer,
      default: null,
    },

    lastEditedBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },

    lastSavedAt: {
      type:    Date,
      default: null,
    },

    version: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

fileContentSchema.index({ roomId: 1, path: 1 }, { unique: true });

fileContentSchema.index({ roomId: 1 });

const FileContent = mongoose.model("FileContent", fileContentSchema);
export default FileContent;