// FILE: client/src/components/Sidebar.jsx
// Left panel: user info, chat list, search, new chat

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import Avatar from "./Avatar";
import NewChatModal from "./NewChatModal";
import NewGroupModal from "./NewGroupModal";
import {
  getChatName,
  getChatAvatar,
  getOtherParticipant,
  truncate,
  formatChatDate,
} from "../utils/helpers";

const Sidebar = ({ onSelectChat }) => {
  const { user, logout } = useAuth();
  const { chats, activeChat, selectChat, onlineUsers, loadingChats, notification } = useChat();
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSelectChat = (chat) => {
    selectChat(chat);
    onSelectChat?.();
  };

  // Filter chats by search query
  const filteredChats = chats.filter((chat) => {
    const name = getChatName(chat, user);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const getPreviewText = (chat) => {
    const msg = chat.latestMessage;
    if (!msg) return "Start a conversation";
    if (msg.messageType === "image") return "📷 Image";
    if (msg.messageType === "file") return `📎 ${msg.fileName || "File"}`;
    const senderPrefix =
      msg.sender?._id === user._id ? "You: " : "";
    return senderPrefix + truncate(msg.content, 35);
  };

  return (
    <div className="flex flex-col h-full bg-[#0f1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <Avatar
            name={user?.username}
            src={user?.avatar}
            size="md"
            online
          />
          <div>
            <p className="font-semibold text-slate-100 text-sm leading-tight">
              {user?.username}
            </p>
            <p className="text-xs text-emerald-500">Online</p>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="btn-ghost p-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <button
                onClick={() => { setShowNewChat(true); setShowMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                New Chat
              </button>
              <button
                onClick={() => { setShowNewGroup(true); setShowMenu(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                New Group
              </button>
              <div className="border-t border-slate-800" />
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search chats…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 py-2 text-sm"
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 px-3 pb-2">
        <button
          onClick={() => setShowNewChat(true)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-400 bg-slate-800/50 hover:bg-slate-800 rounded-xl py-2 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
        <button
          onClick={() => setShowNewGroup(true)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-400 bg-slate-800/50 hover:bg-slate-800 rounded-xl py-2 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          New Group
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {loadingChats ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center py-12 px-4 text-center">
            <p className="text-slate-500 text-sm">
              {search ? "No chats found" : "No conversations yet"}
            </p>
            {!search && (
              <p className="text-slate-600 text-xs mt-1">Start one with the button above</p>
            )}
          </div>
        ) : (
          <ul>
            {filteredChats.map((chat) => {
              const name = getChatName(chat, user);
              const avatar = getChatAvatar(chat, user);
              const isActive = activeChat?._id === chat._id;
              const other = getOtherParticipant(chat, user);
              const isOnline = other && onlineUsers.includes(other._id);
              const hasNotif = notification.some((n) => n.chatId === chat._id);

              return (
                <li key={chat._id}>
                  <button
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full flex items-center gap-3 px-3 py-3 transition-all ${
                      isActive
                        ? "bg-brand-600/15 border-r-2 border-brand-500"
                        : "hover:bg-slate-800/50"
                    }`}
                  >
                    <Avatar
                      name={name}
                      src={avatar}
                      size="md"
                      online={isOnline}
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-slate-200"}`}>
                          {name}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-2 flex-shrink-0">
                          {chat.latestMessage
                            ? formatChatDate(chat.latestMessage.createdAt)
                            : formatChatDate(chat.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-slate-500 truncate">
                          {getPreviewText(chat)}
                        </p>
                        {hasNotif && (
                          <span className="flex-shrink-0 ml-2 w-2 h-2 rounded-full bg-brand-500" />
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modals */}
      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
      {showNewGroup && <NewGroupModal onClose={() => setShowNewGroup(false)} />}
    </div>
  );
};

export default Sidebar;
