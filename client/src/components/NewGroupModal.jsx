// FILE: client/src/components/NewGroupModal.jsx
// Modal to create a group chat — name + select participants

import { useState, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import api from "../utils/axios";
import Avatar from "./Avatar";

const NewGroupModal = ({ onClose }) => {
  const { createGroup, selectChat } = useChat();
  const [step, setStep] = useState(1); // 1: name, 2: add people
  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/auth/search?q=${query}`);
        // Filter out already selected users
        setResults(data.filter((u) => !selected.find((s) => s._id === u._id)));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selected]);

  const toggleUser = (user) => {
    setSelected((prev) => {
      const exists = prev.find((u) => u._id === user._id);
      if (exists) return prev.filter((u) => u._id !== user._id);
      return [...prev, user];
    });
    setResults((prev) => prev.filter((u) => u._id !== user._id));
    setQuery("");
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return setError("Group name is required");
    if (selected.length < 2) return setError("Add at least 2 participants");

    setCreating(true);
    setError("");
    try {
      const chat = await createGroup(
        groupName.trim(),
        selected.map((u) => u._id)
      );
      selectChat(chat);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm mx-4 animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-slate-100">New Group</h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Group name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              placeholder="e.g. Team Alpha"
              value={groupName}
              onChange={(e) => { setGroupName(e.target.value); setError(""); }}
              className="input-base"
            />
          </div>

          {/* Selected participants */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <button
                  key={u._id}
                  onClick={() => toggleUser(u)}
                  className="flex items-center gap-1.5 bg-brand-600/20 border border-brand-500/30 rounded-full pl-1 pr-2.5 py-1 text-xs text-brand-300 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-colors"
                >
                  <Avatar name={u.username} size="xs" />
                  {u.username}
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* User search */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Add Participants
            </label>
            <input
              type="text"
              placeholder="Search by username…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-base"
            />
          </div>

          {/* Search results */}
          <div className="max-h-40 overflow-y-auto space-y-1">
            {loading && (
              <div className="flex justify-center py-3">
                <div className="flex gap-1.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            {results.map((user) => (
              <button
                key={user._id}
                onClick={() => toggleUser(user)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <Avatar name={user.username} src={user.avatar} size="sm" />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-200">{user.username}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="ml-auto">
                  <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                </div>
              </button>
            ))}
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={creating || !groupName.trim() || selected.length < 2}
            className="btn-primary w-full"
          >
            {creating
              ? "Creating…"
              : `Create Group${selected.length > 0 ? ` (${selected.length + 1} members)` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;
