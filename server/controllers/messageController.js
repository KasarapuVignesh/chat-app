// FILE: server/controllers/messageController.js

const Message = require("../models/Message");
const Chat = require("../models/Chat");

// @desc    Send a message (text or media)
// @route   POST /api/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId, content, messageType = "text" } = req.body;

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    // For text messages, content is required
    if (messageType === "text" && !content?.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Verify chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [req.user._id] },
    });

    if (!chat) {
      return res.status(403).json({ message: "Chat not found or access denied" });
    }

    // Build message data
    const messageData = {
      sender: req.user._id,
      chatId,
      content: content || "",
      messageType,
      readBy: [req.user._id],
    };

    // If a file was uploaded, attach media info
    if (req.file) {
      const serverUrl = `${req.protocol}://${req.get("host")}`;
      messageData.mediaUrl = `${serverUrl}/uploads/${req.file.filename}`;
      messageData.fileName = req.file.originalname;
      messageData.messageType = req.file.mimetype.startsWith("image/")
        ? "image"
        : "file";
    }

    // Create and save the message
    let message = await Message.create(messageData);

    // Populate sender details for the response
    message = await message.populate("sender", "username avatar");

    // Update chat's latestMessage reference
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
      updatedAt: new Date(),
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};

// @desc    Get all messages for a chat
// @route   GET /api/message/:chatId
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is in this chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [req.user._id] },
    });

    if (!chat) {
      return res.status(403).json({ message: "Chat not found or access denied" });
    }

    const messages = await Message.find({ chatId })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 }) // Oldest first
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ chatId });

    res.json({
      messages,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/message/:chatId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      { chatId, readBy: { $nin: [req.user._id] } },
      { $push: { readBy: req.user._id } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: "Error marking messages as read" });
  }
};

module.exports = { sendMessage, getChatMessages, markAsRead };
