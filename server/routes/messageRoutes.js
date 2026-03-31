// FILE: server/routes/messageRoutes.js

const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getChatMessages,
  markAsRead,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// Send message (with optional file upload)
router.post("/", protect, upload.single("media"), sendMessage);

// Get messages for a chat
router.get("/:chatId", protect, getChatMessages);

// Mark messages as read
router.put("/:chatId/read", protect, markAsRead);

module.exports = router;
