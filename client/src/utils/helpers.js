// FILE: client/src/utils/helpers.js

/**
 * Get the display name for a chat.
 * For direct chats: returns the other participant's username.
 * For group chats: returns the group name.
 */
export const getChatName = (chat, currentUser) => {
  if (!chat) return "";
  if (chat.isGroupChat) return chat.name;
  const other = chat.participants.find((p) => p._id !== currentUser._id);
  return other?.username || "Unknown";
};

/**
 * Get the avatar for a chat.
 * For direct chats: returns the other participant's avatar.
 * For group chats: returns the group avatar or null.
 */
export const getChatAvatar = (chat, currentUser) => {
  if (!chat) return null;
  if (chat.isGroupChat) return chat.groupAvatar || null;
  const other = chat.participants.find((p) => p._id !== currentUser._id);
  return other?.avatar || null;
};

/**
 * Get the other participant in a 1-to-1 chat.
 */
export const getOtherParticipant = (chat, currentUser) => {
  if (!chat || chat.isGroupChat) return null;
  return chat.participants.find((p) => p._id !== currentUser._id);
};

/**
 * Generate a color from a string (for avatar placeholders).
 */
export const stringToColor = (str = "") => {
  const colors = [
    "#4263eb", "#0ea5e9", "#10b981", "#f59e0b",
    "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Get initials from a name (up to 2 chars).
 */
export const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format a timestamp for message display.
 */
export const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/**
 * Check if a date is today.
 */
export const isToday = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Format date for chat list preview.
 */
export const formatChatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isToday(dateStr)) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

/**
 * Truncate text for previews.
 */
export const truncate = (text = "", maxLength = 40) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
};
