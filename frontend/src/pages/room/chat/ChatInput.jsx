import { useState, useRef } from "react";
import { Send } from "lucide-react";

export default function ChatInput({ onSend, onTyping, onStopTyping }) {
  const [text, setText] = useState("");
  const typingTimer = useRef(null);
  const isTyping = useRef(false);

  const handleChange = (e) => {
    setText(e.target.value);

    // emit typing
    if (!isTyping.current) {
      isTyping.current = true;
      onTyping?.();
    }

    // reset stop-typing timer
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      onStopTyping?.();
    }, 1500);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    // stop typing on send
    clearTimeout(typingTimer.current);
    isTyping.current = false;
    onStopTyping?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-1.5 px-2 py-2 border-t border-[#30363d] flex-shrink-0">
      <textarea
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Message..."
        className="flex-1 bg-[#21262d] border border-[#30363d] focus:border-cyan-500/40 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-white placeholder-gray-600 outline-none resize-none leading-relaxed transition-colors"
        style={{ minHeight: "32px", maxHeight: "96px" }}
        onInput={(e) => {
          e.target.style.height = "auto";
          e.target.style.height = Math.min(96, e.target.scrollHeight) + "px";
        }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="w-8 h-8 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0d1117] flex items-center justify-center transition-colors flex-shrink-0"
      >
        <Send size={13} />
      </button>
    </div>
  );
}