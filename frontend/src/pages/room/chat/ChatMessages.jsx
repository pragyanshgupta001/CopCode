import { useEffect, useRef } from "react";

export default function ChatMessages({ messages, authUser, avatarColors, typingUsers = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getAvatarColor = (userId) => {
    if (!userId) return avatarColors[0];
    const index = userId
      .toString()
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length;
    return avatarColors[index];
  };

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-thin">
      {messages.map((msg, i) => {
        // system message
        if (msg.type === "system") {
          return (
            <div key={msg._id || i} className="text-center py-0.5">
              <span className="font-mono text-[10px] text-gray-600 italic">{msg.text}</span>
            </div>
          );
        }

        const senderId = msg.sender?._id?.toString();
        const myId     = authUser?._id?.toString();
        const isSelf   = senderId === myId;

        return (
          <div key={msg._id || i} className={`flex flex-col gap-0.5 ${isSelf ? "items-end" : "items-start"}`}>
            <div className={`flex items-center gap-1.5 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
              {msg.sender?.profilePic ? (
                <img
                  src={msg.sender.profilePic}
                  alt={msg.sender?.fullName || "user"}
                  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-[#0d1117] flex-shrink-0"
                  style={{ background: getAvatarColor(senderId) }}
                >
                  {msg.sender?.fullName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <span className="font-mono text-[10px] font-semibold text-gray-300">
                {isSelf ? "You" : msg.sender?.fullName}
              </span>
              <span className="font-mono text-[9px] text-gray-700">
                {formatTime(msg.createdAt)}
              </span>
            </div>
            <div
              className={`max-w-[200px] px-2.5 py-1.5 rounded-lg font-sans text-[11px] leading-relaxed break-words ${
                isSelf
                  ? "bg-cyan-500/15 text-cyan-100 rounded-tr-none"
                  : "bg-[#21262d] text-gray-300 rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        );
      })}

      {/* typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <div className="flex gap-0.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="font-mono text-[10px] text-gray-600">
            {typingUsers.map((u) => u.fullName).join(", ")}
            {typingUsers.length === 1 ? " is typing..." : " are typing..."}
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}