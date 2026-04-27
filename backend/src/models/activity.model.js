import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    roomId: {
      type:     String,
      required: true,
      index:    true,
    },

    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    action: {
      type:    String,
      enum:    ["modified", "created", "deleted", "renamed", "pushed"],
      default: "modified",
    },

    filePath: {
      type:     String,
      required: true,
    },

    fileName: {
      type:     String,
      required: true,
    },
  },
  { timestamps: true }
);

activitySchema.index({ roomId: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;