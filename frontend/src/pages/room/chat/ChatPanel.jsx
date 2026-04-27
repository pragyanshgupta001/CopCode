import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const AVATAR_COLORS = [
  "linear-gradient(135deg,#22d3ee,#a78bfa)",
  "linear-gradient(135deg,#4ade80,#22d3ee)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#a78bfa,#ec4899)",
];

export default function ChatPanel({ open, onToggle, room, authUser, socket, roomId }) {
  const [messages, setMessages]     = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // receive chat history on join
    socket.on("chat:history", (history) => {
      setMessages(history);
    });

    // receive new message (text or system)
    socket.on("chat:message", (msg) => {
      setMessages((prev) => {
        const updated = [...prev, msg];
        return updated.slice(-50); // keep last 50 in UI
      });
    });

    // typing indicators
    socket.on("chat:typing", ({ userId, fullName }) => {
      setTypingUsers((prev) => {
        if (prev.find((u) => u.userId === userId)) return prev;
        return [...prev, { userId, fullName }];
      });
    });

    socket.on("chat:stop-typing", ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    return () => {
      socket.off("chat:history");
      socket.off("chat:message");
      socket.off("chat:typing");
      socket.off("chat:stop-typing");
    };
  }, [socket]);

  const handleSend = (text) => {
    if (!text.trim() || !socket || !roomId) return;
    socket.emit("chat:send", { roomId, text: text.trim() });
  };

  const handleTyping = () => {
    if (socket && roomId) socket.emit("chat:typing", roomId);
  };

  const handleStopTyping = () => {
    if (socket && roomId) socket.emit("chat:stop-typing", roomId);
  };

  return (
    <div
      className="flex flex-col bg-[#161b22] border-l border-[#30363d] flex-shrink-0 transition-all duration-200 overflow-hidden"
      style={{ width: open ? "260px" : "36px" }}
    >
      {/* header */}
      <div className="h-8 flex items-center justify-between px-2 border-b border-[#30363d] flex-shrink-0">
        {open && (
          <span className="font-mono text-[9px] text-gray-600 tracking-widest">CHAT</span>
        )}
        <button
          onClick={onToggle}
          className={`text-gray-500 hover:text-gray-200 transition-colors ${!open ? "mx-auto" : ""}`}
        >
          {open ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {open && (
        <>
          <ChatMessages
            messages={messages}
            authUser={authUser}
            avatarColors={AVATAR_COLORS}
            typingUsers={typingUsers}
          />
          <ChatInput
            onSend={handleSend}
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
          />
        </>
      )}
    </div>
  );
}