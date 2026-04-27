import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Copy, Check, LogOut, Wifi, WifiOff } from "lucide-react";
import useRoomStore from "../../store/useRoomStore";
import { useSocketStore } from "../../store/useSocketStore";
import ExportButton from "../../components/ExportButton";

const AVATAR_COLORS = [
  "linear-gradient(135deg,#22d3ee,#a78bfa)",
  "linear-gradient(135deg,#4ade80,#22d3ee)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#a78bfa,#ec4899)",
  "linear-gradient(135deg,#38bdf8,#4ade80)",
];

export default function RoomNavbar({
  room, isOwner, authUser,
  autoSave, onAutoSaveToggle,
  onlineMembers = [],
}) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { clearCurrentRoom } = useRoomStore();
  const { isConnected } = useSocketStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(room.roomId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    clearCurrentRoom();
    navigate("/");
  };

  // show online indicator for each member
  const isOnline = (memberId) =>
    onlineMembers.some((m) => m._id?.toString() === memberId?.toString());

  const getMemberView = (member) => {
    const memberId = member?.user?._id;
    const live = onlineMembers.find((m) => m._id?.toString() === memberId?.toString());
    return {
      fullName: live?.fullName || member?.user?.fullName || "User",
      profilePic: live?.profilePic || member?.user?.profilePic || "",
    };
  };

  return (
    <nav className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-3 flex-shrink-0 select-none">

      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Code2 size={13} className="text-cyan-400" />
          <span className="font-mono text-xs font-bold text-white">
            Cop<span className="text-cyan-400">Code</span>
          </span>
        </div>

        <span className="text-[#30363d] flex-shrink-0">/</span>

        <span className="font-mono text-xs text-gray-400 truncate max-w-[150px]">
          {room.name}
        </span>

        <div className="flex items-center gap-1.5 ml-1 flex-shrink-0">
          <div className="flex -space-x-1.5">
            {room.members?.slice(0, 5).map((m, i) => {
              const online = isOnline(m.user?._id);
              const memberView = getMemberView(m);
              return (
                <div
                  key={m.user?._id || i}
                  title={`${memberView.fullName}${online ? " (online)" : ""}`}
                  className="relative"
                  style={{ zIndex: 5 - i }}
                >
                  {memberView.profilePic ? (
                    <img
                      src={memberView.profilePic}
                      alt={memberView.fullName}
                      className="w-5 h-5 rounded-full border-2 border-[#161b22] object-cover"
                    />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full border-2 border-[#161b22] flex items-center justify-center font-mono font-bold text-[#0d1117]"
                      style={{
                        background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                        fontSize: "7px",
                      }}
                    >
                      {memberView.fullName?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  {/* online dot */}
                  {online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-400 border border-[#161b22]" />
                  )}
                </div>
              );
            })}
          </div>
          <span className="font-mono text-[10px] text-gray-600">
            {onlineMembers.length} online
          </span>
        </div>

        {/* socket connection indicator */}
        <div
          title={isConnected ? "Connected" : "Reconnecting..."}
          className="flex-shrink-0"
        >
          {isConnected
            ? <Wifi size={11} className="text-green-400" />
            : <WifiOff size={11} className="text-red-400 animate-pulse" />
          }
        </div>
      </div>

      {/* ── CENTER — Room ID (owner only) ────────────── */}
      {isOwner && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-mono text-[9px] text-gray-600 tracking-widest hidden sm:block">
            ROOM ID
          </span>
          <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1">
            <span className="font-mono text-[11px] text-cyan-400 tracking-wider select-all">
              {room.roomId}
            </span>
            <button
              onClick={handleCopy}
              className="text-gray-600 hover:text-cyan-400 transition-colors"
              title="Copy Room ID"
            >
              {copied
                ? <Check size={11} className="text-green-400" />
                : <Copy size={11} />
              }
            </button>
          </div>
          {copied && (
            <span className="font-mono text-[10px] text-green-400 hidden sm:block">
              Copied!
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 flex-shrink-0">

        {/* Export ZIP button — visible to all members */}
        <ExportButton roomId={room.roomId} roomName={room.name} />

        {/* AutoSave toggle */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] text-gray-600 hidden sm:block">
            AutoSave
          </span>
          <button
            onClick={onAutoSaveToggle}
            title={autoSave ? "AutoSave ON" : "AutoSave OFF"}
            className={`relative w-7 h-3.5 rounded-full transition-colors duration-200 ${
              autoSave ? "bg-cyan-500" : "bg-[#30363d]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-200 ${
                autoSave ? "left-[14px]" : "left-0.5"
              }`}
            />
          </button>
          <span className={`font-mono text-[9px] w-6 hidden sm:block ${
            autoSave ? "text-cyan-400" : "text-gray-600"
          }`}>
            {autoSave ? "ON" : "OFF"}
          </span>
        </div>

        {/* Leave */}
        <button
          onClick={handleLeave}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-red-500/25 text-red-400 hover:bg-red-500/8 hover:border-red-500/40 transition-colors font-mono text-[10px]"
        >
          <LogOut size={11} />
          <span className="hidden sm:block">Leave Room</span>
        </button>
      </div>
    </nav>
  );
}