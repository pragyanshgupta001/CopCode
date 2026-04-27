import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type:     String,
      required: true,
      index:    true,
    },

    type: {
      type:    String,
      enum:    ["text", "system"],
      default: "text",
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      default: null,
    },

    text: {
      type:      String,
      required:  true,
      maxlength: 2000,
      trim:      true,
    },
  },
  { timestamps: true }
);

messageSchema.index({ roomId: 1, createdAt: -1 });

messageSchema.statics.saveAndTrim = async function (data) {
  const msg = await this.create(data);
  const count = await this.countDocuments({ roomId: data.roomId });
  if (count > 50) {
    const oldest = await this
      .find({ roomId: data.roomId })
      .sort({ createdAt: 1 })
      .limit(count - 50)
      .select("_id");

    await this.deleteMany({
      _id: { $in: oldest.map((m) => m._id) },
    });
  }

  return this.findById(msg._id).populate("sender", "fullName profilePic");
};

const Message = mongoose.model("Message", messageSchema);
export default Message;