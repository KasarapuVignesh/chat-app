// FILE: server/routes/chatRoutes.js

const express = require("express");
const router = express.Router();
const {
  accessDirectChat,
  getUserChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getUserChats);
router.post("/direct", protect, accessDirectChat);
router.post("/group", protect, createGroupChat);
router.put("/group/:chatId/rename", protect, renameGroup);
router.put("/group/:chatId/add", protect, addToGroup);
router.put("/group/:chatId/remove", protect, removeFromGroup);

module.exports = router;
