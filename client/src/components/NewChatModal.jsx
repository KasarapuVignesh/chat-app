// FILE: client/src/components/NewChatModal.jsx
// Modal to search for a user and start a direct chat

import { useState, useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import api from "../utils/axios";
import Avatar from "./Avatar";

const NewChatModal = ({ onClose }) => {
  const { startDirectChat, selectChat } = useChat();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/auth/search?q=${query}`);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (user) => {
    const chat = await startDirectChat(user._id);
    if (chat) {
      selectChat(chat);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm mx-4 animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-slate-100">New Chat</h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by username…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-base"
          />
        </div>

        {/* Results */}
        <div className="p-4 min-h-[80px] max-h-72 overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-4">
              <div className="flex gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-4">
              No users found for "{query}"
            </p>
          )}

          {!loading && !query && (
            <p className="text-center text-slate-600 text-sm py-4">
              Start typing to search users
            </p>
          )}

          {results.map((user) => (
            <button
              key={user._id}
              onClick={() => handleSelect(user)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Avatar name={user.username} src={user.avatar} size="md" />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-200">{user.username}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
