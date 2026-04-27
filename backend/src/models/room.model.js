import mongoose from "mongoose";

const fileNodeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["file", "folder"],
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    path: {
      type: String,
      required: true,
      trim: true,
    },

    parentPath: {
      type: String,
      default: null,
    },

    language: {
      type: String,
      default: "plaintext",
    },

    size: {
      type: Number,
      default: 0,
    },

    isExpanded: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  role: {
    type: String,
    enum: ["owner", "editor"],
    default: "editor",
  },

  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

<<<<<<< HEAD
=======

>>>>>>> a4a12d9 (full project implementation)
const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 200,
      trim: true,
    },

    language: {
      type: String,
      default: "javascript",
      enum: [
        "javascript",
        "typescript",
        "python",
        "rust",
        "go",
        "java",
        "cpp",
        "ruby",
        "kotlin",
        "swift",
        "plaintext",
      ],
    },

    maxMembers: {
      type: Number,
      default: 8,
      min: 2,
      max: 20,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [memberSchema],
<<<<<<< HEAD

    fileTree: [fileNodeSchema],

=======
    fileTree: [fileNodeSchema],
>>>>>>> a4a12d9 (full project implementation)
    activeFile: {
      type: String,
      default: null,
    },

    onlineMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastPushedRepo: {
      type: String,
      default: null,
    },

    lastPushedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

roomSchema.index({ "members.user": 1 });
<<<<<<< HEAD

roomSchema.index({ isActive: 1, lastActivityAt: 1 });

=======
roomSchema.index({ isActive: 1, lastActivityAt: 1 });
>>>>>>> a4a12d9 (full project implementation)
const Room = mongoose.model("Room", roomSchema);

export default Room;