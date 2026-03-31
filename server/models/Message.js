// FILE: server/models/Message.js

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Who sent this message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which chat this belongs to
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    // Text content (optional if media is attached)
    content: {
      type: String,
      trim: true,
      default: "",
    },

    // Message type: text | image | file
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },

    // For media messages: store the URL/path
    mediaUrl: {
      type: String,
      default: "",
    },

    // Original filename for file downloads
    fileName: {
      type: String,
      default: "",
    },

    // Read receipts — track which users have read this
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
