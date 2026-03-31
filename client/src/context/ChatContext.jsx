import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../utils/axios";
import { getSocket } from "../utils/socket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { chatId: [userId, ...] }
  const [notification, setNotification] = useState([]); // Unread msgs in non-active chats

  // Fetch all user chats from API
  const fetchChats = useCallback(async () => {
    if (!user) return;
    setLoadingChats(true);
    try {
      const { data } = await api.get("/api/chat");
      setChats(data);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoadingChats(false);
    }
  }, [user]);

  // Load messages for a chat
  const fetchMessages = useCallback(async (chatId) => {
    setLoadingMessages(true);
    try {
      const { data } = await api.get(`/api/message/${chatId}`);
      setMessages(data.messages);
      await api.put(`/api/message/${chatId}/read`);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Switch active chat
  const selectChat = useCallback(
    async (chat) => {
      const socket = getSocket();

      // Leave previous room
      if (activeChat) {
        socket.emit("chat:leave", activeChat._id);
      }

      setActiveChat(chat);
      setMessages([]);

      if (chat) {
        socket.emit("chat:join", chat._id);
        await fetchMessages(chat._id);

        // Remove from notifications
        setNotification((prev) => prev.filter((n) => n.chatId !== chat._id));
      }
    },
    [activeChat, fetchMessages]
  );

  // Send a message
  const sendMessage = useCallback(
    async (content, mediaFile = null) => {
      if (!activeChat) return;

      try {
        const formData = new FormData();
        formData.append("chatId", activeChat._id);
        if (content) formData.append("content", content);
        if (mediaFile) formData.append("media", mediaFile);

        const { data: message } = await api.post("/api/message", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Emit to socket room for real-time delivery
        const socket = getSocket();
        socket.emit("message:send", { ...message, chatId: activeChat._id });

        // Add to local messages immediately
        setMessages((prev) => [...prev, message]);

        // Update chat list preview
        setChats((prev) =>
          prev
            .map((c) =>
              c._id === activeChat._id ? { ...c, latestMessage: message } : c
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    },
    [activeChat]
  );

  // Create a direct chat with a user
  const startDirectChat = useCallback(async (userId) => {
    try {
      const { data: chat } = await api.post("/api/chat/direct", { userId });
      setChats((prev) => {
        const exists = prev.find((c) => c._id === chat._id);
        return exists ? prev : [chat, ...prev];
      });
      return chat;
    } catch (err) {
      console.error("Failed to start direct chat:", err);
    }
  }, []);

  // Create a group chat
  const createGroup = useCallback(async (name, participantIds) => {
    try {
      const { data: chat } = await api.post("/api/chat/group", {
        name,
        participants: participantIds,
      });
      setChats((prev) => [chat, ...prev]);
      return chat;
    } catch (err) {
      console.error("Failed to create group:", err);
      throw err;
    }
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    // Incoming message from socket
    const handleReceiveMessage = (message) => {
      // If message belongs to the active chat, show it
      setMessages((prev) => {
        // Avoid duplicates (we already added optimistically for sender)
        const exists = prev.find((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });

      // Update chat list
      setChats((prev) =>
        prev
          .map((c) =>
            c._id === message.chatId ? { ...c, latestMessage: message } : c
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );

      // Show notification if message is not in the active chat
      setActiveChat((current) => {
        if (!current || current._id !== message.chatId) {
          if (message.sender._id !== user._id) {
            setNotification((prev) => {
              const exists = prev.find((n) => n.chatId === message.chatId);
              if (exists) return prev;
              return [...prev, { chatId: message.chatId, message }];
            });
          }
        }
        return current;
      });
    };

    // Online users list updated
    const handleOnlineUsers = (userIds) => {
      setOnlineUsers(userIds);
    };

    // Typing started
    const handleTypingStart = ({ userId, username }) => {
      if (userId === user._id) return;
      setTypingUsers((prev) => ({
        ...prev,
        [userId]: username,
      }));
    };

    // Typing stopped
    const handleTypingStop = ({ userId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    };

    socket.on("message:receive", handleReceiveMessage);
    socket.on("users:online", handleOnlineUsers);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("message:receive", handleReceiveMessage);
      socket.off("users:online", handleOnlineUsers);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [user]);

  // Load chats on mount
  useEffect(() => {
    if (user) fetchChats();
  }, [user, fetchChats]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        onlineUsers,
        loadingChats,
        loadingMessages,
        typingUsers,
        notification,
        fetchChats,
        selectChat,
        sendMessage,
        startDirectChat,
        createGroup,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
