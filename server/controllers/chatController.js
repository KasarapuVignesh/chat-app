// FILE: server/controllers/chatController.js

const Chat = require("../models/Chat");
const User = require("../models/User");

// @desc    Access or create a 1-to-1 chat with another user
// @route   POST /api/chat/direct
// @access  Private
const accessDirectChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Check if a direct chat already exists between these two users
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [req.user._id, userId] },
    })
      .populate("participants", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "username avatar" },
      });

    if (chat) {
      return res.json(chat);
    }

    // Create new direct chat
    const newChat = await Chat.create({
      isGroupChat: false,
      participants: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "participants",
      "-password"
    );

    res.status(201).json(fullChat);
  } catch (error) {
    console.error("Access direct chat error:", error);
    res.status(500).json({ message: "Error accessing chat" });
  }
};

// @desc    Get all chats for the logged-in user
// @route   GET /api/chat
// @access  Private
const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user._id] },
    })
      .populate("participants", "-password")
      .populate("groupAdmin", "-password")
      .populate({
        path: "latestMessage",
        populate: { path: "sender", select: "username avatar" },
      })
      .sort({ updatedAt: -1 }); // Most recently active first

    res.json(chats);
  } catch (error) {
    console.error("Get user chats error:", error);
    res.status(500).json({ message: "Error fetching chats" });
  }
};

// @desc    Create a new group chat
// @route   POST /api/chat/group
// @access  Private
const createGroupChat = async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || participants.length < 2) {
      return res.status(400).json({
        message: "Group name and at least 2 other participants required",
      });
    }

    // Include creator in participants
    const allParticipants = [...new Set([...participants, req.user._id.toString()])];

    const group = await Chat.create({
      name,
      isGroupChat: true,
      participants: allParticipants,
      groupAdmin: req.user._id,
    });

    const fullGroup = await Chat.findById(group._id)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(fullGroup);
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ message: "Error creating group chat" });
  }
};

// @desc    Rename a group chat
// @route   PUT /api/chat/group/:chatId/rename
// @access  Private (admin only)
const renameGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { name } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only group admin can rename" });
    }

    chat.name = name;
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.json(updated);
  } catch (error) {
    console.error("Rename group error:", error);
    res.status(500).json({ message: "Error renaming group" });
  }
};

// @desc    Add a user to a group
// @route   PUT /api/chat/group/:chatId/add
// @access  Private (admin only)
const addToGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    if (chat.participants.includes(userId)) {
      return res.status(400).json({ message: "User already in group" });
    }

    chat.participants.push(userId);
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.json(updated);
  } catch (error) {
    console.error("Add to group error:", error);
    res.status(500).json({ message: "Error adding user to group" });
  }
};

// @desc    Remove a user from a group (or leave)
// @route   PUT /api/chat/group/:chatId/remove
// @access  Private
const removeFromGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Allow admin to remove anyone, or user to remove themselves
    const isAdmin = chat.groupAdmin.toString() === req.user._id.toString();
    const isSelf = userId === req.user._id.toString();

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Not authorized" });
    }

    chat.participants = chat.participants.filter(
      (p) => p.toString() !== userId
    );
    await chat.save();

    const updated = await Chat.findById(chatId)
      .populate("participants", "-password")
      .populate("groupAdmin", "-password");

    res.json(updated);
  } catch (error) {
    console.error("Remove from group error:", error);
    res.status(500).json({ message: "Error removing user" });
  }
};

module.exports = {
  accessDirectChat,
  getUserChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
