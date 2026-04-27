import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Hash } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function FloatingCard({ className, filename, lines }) {
  return (
    <div className={`absolute hidden xl:block code-window w-64 opacity-55 hover:opacity-85 transition-opacity duration-300 ${className}`}>
      <div className="code-titlebar">
        <span className="dot-red" /><span className="dot-yellow" /><span className="dot-green" />
        <span className="ml-2 font-mono text-xs text-gray-600">{filename}</span>
      </div>
      <div className="px-4 py-3 space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} className="font-mono text-xs leading-6" style={{ color: line.color ?? "#8b949e" }}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function Terminal() {
  const steps = [
    { type: "cmd", text: 'copcode create --room "Team Alpha"' },
    { type: "out", text: "✓ Room created successfully" },
    { type: "cmd", text: "copcode invite --all" },
    { type: "out", text: "✓ 4 developers joined the room" },
    { type: "cursor" },
  ];
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count < steps.length) {
      const t = setTimeout(() => setCount((c) => c + 1), 520);
      return () => clearTimeout(t);
    }
  }, [count]);

  return (
    <div className="code-window max-w-2xl mx-auto shadow-2xl shadow-black/50 border-cyan-500/10">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0d1117]/80 border-b border-[#1e2a3a]">
        <span className="dot-red" /><span className="dot-yellow" /><span className="dot-green" />
        <span className="ml-3 font-mono text-xs text-gray-500 tracking-wide">copcode — terminal</span>
      </div>
      <div className="px-5 py-4 min-h-[148px] space-y-0.5">
        {steps.slice(0, count).map((step, i) => {
          if (step.type === "cursor") {
            return (
              <div key={i} className="flex items-center gap-1 pt-0.5">
                <span className="font-mono text-sm text-cyan-400">$</span>
                <span className="w-2 h-4 bg-cyan-400 animate-blink ml-1 inline-block" />
              </div>
            );
          }
          return (
            <div key={i} className="font-mono text-sm leading-7">
              {step.type === "cmd" && <span className="text-cyan-400">$ </span>}
              <span className={step.type === "out" ? "text-cyan-400" : "text-white"}>
                {step.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HeroS() {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  const handleProtectedNav = (to) => {
    if (!authUser) {
      navigate("/login", {
        state: { redirectTo: to },
      });
      return;
    }
    navigate(to);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-20 px-6 overflow-hidden bg-[#0d1117]">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[500px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <FloatingCard className="top-32 left-6 animate-float" filename="room.js"
        lines={[{ text: "const room = await" }, { text: "  createRoom();" }, { text: "await" }, { text: "  room.invite(team);" }]} />
      <FloatingCard className="top-40 right-6 animate-float [animation-delay:1.5s]" filename="sync.js"
        lines={[{ text: "function collab() {" }, { text: "  editor.sync(delta);" }, { text: "  chat.broadcast(msg);" }, { text: "}" }]} />
      <FloatingCard className="bottom-44 left-6 animate-float [animation-delay:0.8s]" filename="ws.js"
        lines={[{ text: "// Real-time sync", color: "#6e7681" }, { text: 'ws.on("change", d => {' }, { text: "  editor.apply(d);" }, { text: "});" }]} />

      <div className="relative z-10 text-center max-w-4xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/5 mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs text-cyan-400 tracking-widest">
            Real-time collaboration is live
          </span>
        </div>

        <h1 className="font-mono font-bold leading-[1.05] mb-6">
          <span className="block text-5xl sm:text-6xl md:text-7xl text-white animate-fade-up delay-100">
            Code Together.
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl text-cyan-400 glow-cyan animate-fade-up delay-200">
            Build Faster.
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up delay-300">
          A real-time collaborative coding platform with shared main editor
          and personal workspace.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-14 animate-fade-up delay-400">
          {/* Create Room — protected */}
          <button
            onClick={() => handleProtectedNav("/create-room")}
            className="btn-primary flex items-center gap-2 text-base px-8 py-3.5"
          >
            <Zap size={16} />
            Create a Room
          </button>

          {/* Join Room — protected */}
          <button
            onClick={() => handleProtectedNav("/join-room")}
            className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5"
          >
            <Hash size={16} />
            Join a Room
          </button>
        </div>

        <div className="animate-fade-up delay-500">
          <Terminal />
        </div>
      </div>
    </section>
  );
}
