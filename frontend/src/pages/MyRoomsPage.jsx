import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Code2, Users, Clock, Globe, Plus, Hash, ArrowRight, Loader2,
} from "lucide-react";
import  useRoomStore  from "../store/useRoomStore";
import { useAuthStore } from "../store/useAuthStore";

const LANG_COLORS = {
  javascript: "#f7df1e", typescript: "#3178c6",
  python:     "#3572A5", cpp:        "#f34b7d",
  java:       "#b07219", rust:       "#dea584",
  go:         "#00ADD8", ruby:       "#701516",
  plaintext:  "#8b949e",
};

function RoomCard({ room, authUser, onJoin }) {
  const isOwner    = room.owner?._id?.toString() === authUser?._id?.toString();
  const isOnline   = room.onlineMembers?.length > 0;
  const langColor  = LANG_COLORS[room.language] || "#8b949e";

  const lastActive = room.lastActivityAt
    ? new Date(room.lastActivityAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div className="bg-[#161b22] border border-[#30363d] hover:border-cyan-500/30 rounded-xl overflow-hidden transition-all duration-200 group">
      {/* top bar — language color accent */}
      <div className="h-0.5" style={{ background: langColor }} />

      <div className="px-5 py-4">
        {/* header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-mono font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
              {room.name}
            </h3>
            {room.description && (
              <p className="font-mono text-xs text-gray-600 mt-0.5 truncate">
                {room.description}
              </p>
            )}
          </div>
          {/* role badge */}
          <span className={`flex-shrink-0 font-mono text-[10px] px-2 py-0.5 rounded border ${
            isOwner
              ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/5"
              : "text-gray-500 border-gray-700"
          }`}>
            {isOwner ? "Owner" : "Editor"}
          </span>
        </div>

        {/* meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* language */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: langColor }} />
            <span className="font-mono text-[11px] text-gray-500 capitalize">{room.language}</span>
          </div>

          {/* members */}
          <div className="flex items-center gap-1.5 text-gray-600">
            <Users size={11} />
            <span className="font-mono text-[11px]">
              {room.members?.length || 0}/{room.maxMembers || 8}
            </span>
          </div>

          {/* last active */}
          <div className="flex items-center gap-1.5 text-gray-700">
            <Clock size={11} />
            <span className="font-mono text-[11px]">{lastActive}</span>
          </div>

          {/* online indicator */}
          {isOnline && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-[11px] text-green-400">
                {room.onlineMembers.length} online
              </span>
            </div>
          )}
        </div>

        {/* room ID + open button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 font-mono text-[10px] text-gray-700">
            <Hash size={10} />
            <span className="select-all">{room.roomId?.slice(0, 12)}…</span>
          </div>
          <button
            onClick={() => onJoin(room)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0d1117] font-mono text-[11px] font-bold transition-colors"
          >
            Open
            <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyRoomsPage() {
  const { myRooms, getMyRooms, joinRoom, isJoining, isFetchingMyRooms } = useRoomStore();
  const { authUser } = useAuthStore();
  const navigate     = useNavigate();
  const loading      = isFetchingMyRooms || myRooms === null;

  useEffect(() => {
    getMyRooms();
  }, []);

  const handleJoin = async (room) => {
    const result = await joinRoom(room.roomId);
    if (result) {
      const slug = room.name.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
        .replace(/-+/g, "-").replace(/^-|-$/g, "") || "room";
      navigate(`/room/${slug}`, { state: { roomId: result.roomId } });
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center px-6 gap-3">
        <Link to="/" className="flex items-center gap-2">
          <Code2 size={16} className="text-cyan-400" />
          <span className="font-mono font-bold text-white">
            Cop<span className="text-cyan-400">Code</span>
          </span>
        </Link>
        <span className="text-[#30363d]">/</span>
        <span className="font-mono text-sm text-gray-400">My Rooms</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-[10px] text-cyan-400 tracking-widest mb-1">
              // your.rooms
            </p>
            <h1 className="font-mono font-bold text-2xl text-white">My Rooms</h1>
            <p className="font-mono text-sm text-gray-500 mt-1">
              All rooms you've created or joined
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/join-room"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#30363d] text-gray-400 hover:text-white hover:border-gray-500 font-mono text-sm transition-colors"
            >
              <Hash size={13} />
              Join
            </Link>
            <Link
              to="/create-room"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0d1117] font-mono text-sm font-bold transition-colors"
            >
              <Plus size={13} />
              New Room
            </Link>
          </div>
        </div>

        {/* content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-cyan-400 animate-spin" />
          </div>
        ) : myRooms?.length === 0 ? (
          /* empty state */
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl px-8 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#0d1117] border border-[#30363d] flex items-center justify-center mx-auto mb-4">
              <Globe size={24} className="text-gray-700" />
            </div>
            <p className="font-mono text-gray-500 mb-1">No rooms yet</p>
            <p className="font-mono text-xs text-gray-700 mb-6">
              Create a room or join one with a Room ID
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/create-room"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#0d1117] font-mono text-sm font-bold transition-colors"
              >
                <Plus size={14} />
                Create Room
              </Link>
              <Link
                to="/join-room"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#30363d] text-gray-400 hover:text-white font-mono text-sm transition-colors"
              >
                <Hash size={14} />
                Join Room
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myRooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                authUser={authUser}
                onJoin={handleJoin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
