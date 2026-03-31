// FILE: client/src/components/MessageBubble.jsx
// Individual message bubble — own vs others, text/image/file

import Avatar from "./Avatar";
import { formatTime } from "../utils/helpers";

const MessageBubble = ({ message, isOwn, showAvatar, isGroupChat }) => {
  const { sender, content, messageType, mediaUrl, fileName, createdAt } = message;

  return (
    <div
      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"} ${
        showAvatar ? "mt-3" : "mt-0.5"
      }`}
    >
      {/* Avatar — only for others, only when sender changes */}
      <div className="w-8 flex-shrink-0">
        {!isOwn && showAvatar && (
          <Avatar name={sender?.username} src={sender?.avatar} size="sm" />
        )}
      </div>

      <div
        className={`flex flex-col max-w-[70%] ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* Sender name in group chats (non-own messages) */}
        {!isOwn && isGroupChat && showAvatar && (
          <span className="text-[11px] font-medium text-brand-400 ml-1 mb-0.5">
            {sender?.username}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`relative rounded-2xl px-3.5 py-2.5 ${
            isOwn
              ? "bg-brand-600 text-white rounded-br-sm"
              : "bg-slate-800 text-slate-100 rounded-bl-sm"
          } animate-fade-in`}
        >
          {/* Text content */}
          {messageType === "text" && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </p>
          )}

          {/* Image content */}
          {messageType === "image" && (
            <div>
              <img
                src={mediaUrl}
                alt="Shared image"
                className="rounded-xl max-w-xs max-h-64 object-cover cursor-pointer"
                onClick={() => window.open(mediaUrl, "_blank")}
              />
              {content && (
                <p className="text-sm mt-1.5 leading-relaxed">{content}</p>
              )}
            </div>
          )}

          {/* File content */}
          {messageType === "file" && (
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 ${
                isOwn ? "text-white/90 hover:text-white" : "text-slate-300 hover:text-white"
              } transition-colors`}
            >
              <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium truncate max-w-[180px]">
                {fileName || "Download file"}
              </span>
            </a>
          )}

          {/* Timestamp */}
          <p
            className={`text-[10px] mt-1 ${
              isOwn ? "text-white/50 text-right" : "text-slate-500"
            }`}
          >
            {formatTime(createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
