// FILE: client/src/components/InputBox.jsx
// Message composer with text, file upload, and typing indicators

import { useState, useRef, useCallback, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../utils/socket";

const InputBox = () => {
  const { user } = useAuth();
  const { activeChat, sendMessage } = useChat();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Emit typing:start / typing:stop via socket
  const handleTypingStart = useCallback(() => {
    if (!activeChat || isTypingRef.current) return;
    isTypingRef.current = true;
    const socket = getSocket();
    socket.emit("typing:start", {
      chatId: activeChat._id,
      userId: user._id,
      username: user.username,
    });
  }, [activeChat, user]);

  const handleTypingStop = useCallback(() => {
    if (!activeChat || !isTypingRef.current) return;
    isTypingRef.current = false;
    const socket = getSocket();
    socket.emit("typing:stop", {
      chatId: activeChat._id,
      userId: user._id,
    });
  }, [activeChat, user]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    handleTypingStart();

    // Stop typing after 1.5s of inactivity
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(handleTypingStop, 1500);
  };

  // Stop typing when component unmounts or chat changes
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      handleTypingStop();
    };
  }, [activeChat, handleTypingStop]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile(file);
    // Reset file input so same file can be selected again
    e.target.value = "";
  };

  const removeFile = () => setPreviewFile(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (sending || (!text.trim() && !previewFile)) return;

    clearTimeout(typingTimeoutRef.current);
    handleTypingStop();

    setSending(true);
    try {
      await sendMessage(text.trim(), previewFile);
      setText("");
      setPreviewFile(null);
    } finally {
      setSending(false);
    }
  };

  // Send on Enter (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isImage = previewFile?.type.startsWith("image/");

  return (
    <div className="px-4 py-3 border-t border-slate-800/60 flex-shrink-0">
      {/* File preview */}
      {previewFile && (
        <div className="mb-2 flex items-center gap-2 bg-slate-800/60 rounded-xl px-3 py-2">
          {isImage ? (
            <img
              src={URL.createObjectURL(previewFile)}
              alt="preview"
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
          <span className="text-xs text-slate-400 truncate flex-1">{previewFile.name}</span>
          <button
            onClick={removeFile}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* File attach button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-ghost p-2.5 flex-shrink-0 text-slate-500 hover:text-slate-300"
          title="Attach file"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="input-base resize-none py-2.5 pr-4 max-h-32 overflow-y-auto"
            style={{ minHeight: "44px" }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={sending || (!text.trim() && !previewFile)}
          className={`flex-shrink-0 p-2.5 rounded-xl transition-all active:scale-95 ${
            text.trim() || previewFile
              ? "bg-brand-600 hover:bg-brand-700 text-white"
              : "bg-slate-800 text-slate-600 cursor-not-allowed"
          }`}
        >
          {sending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputBox;
