// FILE: server/models/Chat.js

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // Chat name (only for group chats)
    name: {
      type: String,
      trim: true,
      default: "",
    },

    // Is this a group chat?
    isGroupChat: {
      type: Boolean,
      default: false,
    },

    // All participants in this chat
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Group chat admin (only relevant for group chats)
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Reference to the latest message for preview in sidebar
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // Optional group avatar
    groupAvatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
