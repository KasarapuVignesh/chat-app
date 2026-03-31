// FILE: client/src/pages/ChatDashboard.jsx
// Main layout: sidebar (chat list) + chat window

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { useChat } from "../context/ChatContext";

const ChatDashboard = () => {
  const { activeChat } = useChat();
  // On mobile, track if the user has navigated to the chat view
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleSelectChat = () => {
    setMobileShowChat(true);
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  return (
    <div className="flex h-full bg-[#0f1117]">
      {/* Sidebar */}
      <div
        className={`
          ${mobileShowChat ? "hidden" : "flex"} 
          md:flex flex-col
          w-full md:w-80 lg:w-96
          border-r border-slate-800/60
          flex-shrink-0
        `}
      >
        <Sidebar onSelectChat={handleSelectChat} />
      </div>

      {/* Chat area */}
      <div
        className={`
          ${!mobileShowChat && !activeChat ? "hidden" : "flex"}
          md:flex flex-col flex-1 min-w-0
        `}
      >
        {activeChat ? (
          <ChatBox onBack={handleBackToList} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

// Shown on desktop when no chat is selected
const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
    <div className="w-20 h-20 rounded-3xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-5">
      <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
    <h2 className="text-lg font-semibold text-slate-300">No chat selected</h2>
    <p className="text-slate-600 mt-1 text-sm max-w-xs">
      Choose a conversation from the sidebar or start a new one
    </p>
  </div>
);

export default ChatDashboard;
