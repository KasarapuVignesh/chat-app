// FILE: client/src/components/ChatBox.jsx
// The right panel: header, messages, input

import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";
import { getChatName, getChatAvatar, getOtherParticipant } from "../utils/helpers";

const ChatBox = ({ onBack }) => {
  const { user } = useAuth();
  const {
    activeChat,
    messages,
    loadingMessages,
    typingUsers,
    onlineUsers,
  } = useChat();

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (!activeChat) return null;

  const chatName = getChatName(activeChat, user);
  const chatAvatar = getChatAvatar(activeChat, user);
  const other = getOtherParticipant(activeChat, user);
  const isOnline = other && onlineUsers.includes(other._id);

  // Who is currently typing (excluding self)?
  const typingList = Object.values(typingUsers);

  return (
    <div className="flex flex-col h-full bg-[#0f1117]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 flex-shrink-0">
        {/* Back button on mobile */}
        <button
          onClick={onBack}
          className="md:hidden btn-ghost p-1.5 -ml-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <Avatar
          name={chatName}
          src={chatAvatar}
          size="md"
          online={isOnline}
        />

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-slate-100 text-sm truncate">{chatName}</h2>
          <p className="text-xs text-slate-500">
            {activeChat.isGroupChat
              ? `${activeChat.participants.length} members`
              : isOnline
              ? "Online"
              : "Offline"}
          </p>
        </div>

        {/* Group info indicator */}
        {activeChat.isGroupChat && (
          <div className="flex items-center gap-1">
            {activeChat.participants.slice(0, 3).map((p) => (
              <Avatar key={p._id} name={p.username} src={p.avatar} size="xs" />
            ))}
            {activeChat.participants.length > 3 && (
              <span className="text-xs text-slate-500">
                +{activeChat.participants.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loadingMessages ? (
          <div className="flex justify-center py-12">
            <div className="flex gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No messages yet</p>
            <p className="text-slate-600 text-xs mt-1">Be the first to say something!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              // Group consecutive messages from same sender
              const showAvatar =
                !prevMsg || prevMsg.sender._id !== msg.sender._id;
              return (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isOwn={msg.sender._id === user._id}
                  showAvatar={showAvatar}
                  isGroupChat={activeChat.isGroupChat}
                />
              );
            })}
          </>
        )}

        {/* Typing indicator */}
        {typingList.length > 0 && (
          <div className="flex items-center gap-2 pl-2 animate-fade-in">
            <div className="flex gap-1 bg-slate-800 rounded-2xl px-3 py-2.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
            <span className="text-xs text-slate-500">
              {typingList.join(", ")} {typingList.length === 1 ? "is" : "are"} typing…
            </span>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <InputBox />
    </div>
  );
};

export default ChatBox;
