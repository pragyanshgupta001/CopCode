import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, Hash, ArrowRight, Users } from "lucide-react";
import CodeWindow from "../components/CodeWindow";
import  useRoomStore  from "../store/useRoomStore";
import { useAuthStore } from "../store/useAuthStore";

export default function JoinRoomPage() {
  const [roomId, setRoomId]         = useState("");
  const [roomIdError, setRoomIdError] = useState("");

  const { joinRoom, getMyRooms, myRooms, isJoining } = useRoomStore();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  const recentRooms = myRooms ?? [];

  const loadRooms = useCallback(() => {
    getMyRooms();
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const validateRoomId = (value) => {
    const trimmed = value.trim();

    if (!trimmed) {
      setRoomIdError("Room ID is required");
      return false;
    }

    const normalized = trimmed.toLowerCase();
    const pattern = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/;

    if (!pattern.test(normalized)) {
      setRoomIdError("Invalid format — should be like abc1-de2f-gh3i");
      return false;
    }

    setRoomIdError("");
    return true;
  };

  const goToRoom = (result) => {
    navigate(`/room/${result.slug}`, {
      state: { roomId: result.roomId },
    });
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!validateRoomId(roomId)) return;

    const result = await joinRoom(roomId.trim());
    if (result) goToRoom(result);
  };

  const handleRejoin = async (recentRoomId) => {
    const result = await joinRoom(recentRoomId);
    if (result) goToRoom(result);
  };

  const getUserRole = (room) => {
    if (!authUser || !room?.members) return "Editor";

    const member = room.members.find(
      (m) => m.user?._id?.toString() === authUser._id?.toString()
    );

    return member?.role === "owner" ? "Owner" : "Editor";
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 justify-center mb-8 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0e2233] border border-cyan-500/30 group-hover:border-cyan-400/60 flex items-center justify-center transition-colors">
            <Code2 size={20} className="text-cyan-400" />
          </div>
          <span className="font-mono font-bold text-xl text-white">
            Cop<span className="text-cyan-400">Code</span>
          </span>
        </Link>

        {/* ── Join by ID form ──────────────────────────── */}
        <CodeWindow filename="join-room.jsx" className="shadow-2xl mb-5">
          <form onSubmit={handleJoin} className="px-7 py-8 space-y-6">
            <div>
              <p className="font-mono text-xs text-cyan-400 tracking-widest mb-1">
                // JOIN SESSION
              </p>
              <h1 className="font-mono font-bold text-2xl text-white">
                Join a Room
              </h1>
            </div>

            <div>
              <label className="font-mono text-xs text-gray-500 tracking-widest block mb-2">
                ROOM ID
              </label>
              <div className="relative">
                <Hash
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    if (roomIdError) validateRoomId(e.target.value);
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim()) validateRoomId(e.target.value);
                  }}
                  placeholder="e.g. abc1-de2f-gh3i"
                  className={`input-field pl-10 ${
                    roomIdError
                      ? "border-red-500/60 focus:border-red-400"
                      : ""
                  }`}
                />
              </div>

              {roomIdError ? (
                <p className="font-mono text-xs text-red-400 mt-2">
                  {roomIdError}
                </p>
              ) : (
                <p className="font-mono text-xs text-gray-600 mt-2">
                  Paste the room ID shared by your teammate.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isJoining || !roomId.trim()}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0d1117] font-mono font-bold py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              <ArrowRight size={16} />
              {isJoining ? "Joining..." : "Join Room"}
            </button>
          </form>
        </CodeWindow>

        {/* ── Recent rooms ─────────────────────────────── */}
        <CodeWindow filename="recent.json" className="shadow-xl">
          <div className="px-5 py-3.5 border-b border-[#1e2a3a]">
            <p className="font-mono text-xs text-gray-500 tracking-widest">
              RECENT ROOMS
            </p>
          </div>

          <div className="divide-y divide-[#1e2a3a]">
            {recentRooms.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="font-mono text-xs text-gray-600">
                  No recent rooms yet.
                </p>
                <p className="font-mono text-xs text-gray-700 mt-1">
                  Create or join a room to see it here.
                </p>
              </div>
            ) : (
              recentRooms.slice(0, 5).map((room) => {
                const role = getUserRole(room);
                const isOnline = room.onlineMembers?.length > 0;

                return (
                  <button
                    key={room._id}
                    onClick={() => handleRejoin(room.roomId)}
                    disabled={isJoining}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#1c2333] transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* left side */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* online / offline dot */}
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isOnline
                            ? "bg-green-400 animate-pulse"
                            : "bg-gray-600"
                        }`}
                      />

                      <div className="min-w-0">
                        <p className="font-mono text-sm text-white group-hover:text-cyan-400 transition-colors truncate">
                          {room.name}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 font-mono text-xs text-gray-600">
                            <Users size={10} />
                            {room.members?.length || 0}
                          </span>
                          <span className="font-mono text-xs text-gray-600 capitalize">
                            {room.language}
                          </span>
                          <span className="font-mono text-xs text-gray-700">
                            {new Date(
                              room.lastActivityAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* right side — role badge + short ID */}
                    <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                      <span
                        className={`font-mono text-xs px-1.5 py-0.5 rounded border ${
                          role === "Owner"
                            ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/5"
                            : "text-gray-500 border-gray-700"
                        }`}
                      >
                        {role}
                      </span>
                      <span className="font-mono text-xs text-gray-600 group-hover:text-cyan-400 transition-colors">
                        #{room.roomId?.slice(0, 8)}…
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </CodeWindow>

        <p className="text-center font-mono text-xs text-gray-700 mt-5">
          <Link to="/" className="hover:text-gray-500 transition-colors">
            ← Back to home
          </Link>
          <span className="mx-3 text-gray-800">|</span>
          <Link
            to="/create-room"
            className="hover:text-gray-500 transition-colors"
          >
            Create a room instead →
          </Link>
        </p>
      </div>
    </div>
  );
}