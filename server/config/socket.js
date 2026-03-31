// FILE: server/config/socket.js
// All Socket.IO event logic — rooms, messaging, typing, presence

// Track online users: userId -> socketId
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User comes online — store their socketId
    socket.on("user:online", (userId) => {
      onlineUsers.set(userId, socket.id);
      // Broadcast updated online user list to everyone
      io.emit("users:online", Array.from(onlineUsers.keys()));
      console.log(`👤 User online: ${userId}`);
    });

    // Join a specific chat room
    socket.on("chat:join", (chatId) => {
      socket.join(chatId);
      console.log(`📥 Socket ${socket.id} joined room: ${chatId}`);
    });

    // Leave a chat room
    socket.on("chat:leave", (chatId) => {
      socket.leave(chatId);
      console.log(`📤 Socket ${socket.id} left room: ${chatId}`);
    });

    // New message sent — broadcast to room
    socket.on("message:send", (message) => {
      // Emit to all clients in the chat room (including sender for confirmation)
      io.to(message.chatId).emit("message:receive", message);
    });

    // Typing indicator — started
    socket.on("typing:start", ({ chatId, userId, username }) => {
      socket.to(chatId).emit("typing:start", { userId, username });
    });

    // Typing indicator — stopped
    socket.on("typing:stop", ({ chatId, userId }) => {
      socket.to(chatId).emit("typing:stop", { userId });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      // Find and remove user from online map
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit("users:online", Array.from(onlineUsers.keys()));
          console.log(`👋 User offline: ${userId}`);
          break;
        }
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { socketHandler };
