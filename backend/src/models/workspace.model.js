import mongoose from "mongoose";

const workspaceFileSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    language: {
      type: String,
      default: "plaintext",
    },

    content: {
      type: String,
      default: "",
    },

    sourcePath: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

const workspaceSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    files: [workspaceFileSchema],
  },
  { timestamps: true }
);

workspaceSchema.index({ roomId: 1, owner: 1 }, { unique: true });
const Workspace = mongoose.model("Workspace", workspaceSchema);
export default Workspace;