import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, Plus, Copy, Check, ArrowRight } from "lucide-react";
import CodeWindow from "../components/CodeWindow";
import  useRoomStore  from "../store/useRoomStore";

const LANGUAGES = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python",     value: "python"     },
  { label: "Rust",       value: "rust"       },
  { label: "Go",         value: "go"         },
  { label: "Java",       value: "java"       },
  { label: "C++",        value: "cpp"        },
  { label: "Ruby",       value: "ruby"       },
  { label: "Kotlin",     value: "kotlin"     },
  { label: "Swift",      value: "swift"      },
];

const toSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");


// shown after room is created so owner can copy roomId
// before entering the room
function SuccessModal({ roomId, roomName, slug, onEnter }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "16px",
      }}
    >
      <div className="w-full max-w-md bg-[#161b22] border border-[#1e2a3a] rounded-2xl overflow-hidden shadow-2xl">

        {/* title bar */}
        <div className="flex items-center gap-1.5 px-5 py-3.5 bg-[#0d1117]/60 border-b border-[#1e2a3a]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-xs text-gray-500">
            room-created.md
          </span>
        </div>

        <div className="px-7 py-8">

          {/* success indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Check size={20} className="text-green-400" />
            </div>
            <div>
              <p className="font-mono font-bold text-white text-base">
                Room created!
              </p>
              <p className="font-mono text-xs text-gray-500 mt-0.5">
                {roomName}
              </p>
            </div>
          </div>

          {/* room ID — the key thing to share */}
          <div className="mb-6">
            <p className="font-mono text-xs text-gray-500 tracking-widest mb-2">
              ROOM ID — SHARE THIS TO INVITE TEAMMATES
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0d1117] border border-[#1e2a3a] rounded-lg px-4 py-3 font-mono text-sm text-cyan-400 select-all tracking-wider">
                {roomId}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-[#1e2a3a] hover:border-cyan-500/40 bg-[#0d1117] text-gray-400 hover:text-cyan-400 transition-all font-mono text-xs whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    Copy ID
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-xs text-gray-700 mt-2">
              Anyone with this ID can join your room instantly.
            </p>
          </div>

          {/* divider */}
          <div className="border-t border-[#1e2a3a] mb-6" />

          {/* enter room button */}
          <button
            onClick={onEnter}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-[#0d1117] font-mono font-bold py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20"
          >
            Enter Room
            <ArrowRight size={16} />
          </button>

          <p className="text-center font-mono text-xs text-gray-600 mt-3">
            You can always find your Room ID on the room settings page
          </p>
        </div>
      </div>
    </div>
  );
}

//CreateRoomPage
export default function CreateRoomPage() {
  const [form, setForm] = useState({
    name: "",
    language: "typescript",
    maxUsers: 8,
    description: "",
  });

  const [nameError, setNameError] = useState("");

  const [createdRoom, setCreatedRoom] = useState(null);

  const { createRoom, isCreating } = useRoomStore();
  const navigate = useNavigate();

  //validation
  const validateName = (value) => {
    if (!value.trim()) {
      setNameError("Room name is required");
      return false;
    }
    if (value.trim().length < 2) {
      setNameError("Room name must be at least 2 characters");
      return false;
    }
    if (value.trim().length > 60) {
      setNameError("Room name cannot exceed 60 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  //submit
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateName(form.name)) return;

    const result = await createRoom(form);

    if (result) {
      setCreatedRoom({
        roomId: result.roomId,
        slug: result.slug,
        roomName: form.name.trim(),
      });
    }
  };

  //enter room after copying ID
  const handleEnterRoom = () => {
    navigate(`/room/${createdRoom.slug}`, {
      state: { roomId: createdRoom.roomId },
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 py-12">

      {/* success modal — shown after room created */}
      {createdRoom && (
        <SuccessModal
          roomId={createdRoom.roomId}
          roomName={createdRoom.roomName}
          slug={createdRoom.slug}
          onEnter={handleEnterRoom}
        />
      )}

      <div className="w-full max-w-lg">

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

        <CodeWindow filename="create-room.jsx" className="shadow-2xl">
          <form onSubmit={handleCreate} className="px-7 py-8 space-y-6">

            <div>
              <p className="font-mono text-xs text-cyan-400 tracking-widest mb-1">
                // NEW ROOM
              </p>
              <h1 className="font-mono font-bold text-2xl text-white">
                Create a Room
              </h1>
            </div>

            {/* room name */}
            <div>
              <label className="font-mono text-xs text-gray-500 tracking-widest block mb-2">
                ROOM NAME
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  if (nameError) validateName(e.target.value);
                }}
                onBlur={(e) => validateName(e.target.value)}
                placeholder="team-alpha-sprint-3"
                maxLength={60}
                className={`input-field ${
                  nameError
                    ? "border-red-500/60 focus:border-red-400"
                    : ""
                }`}
              />
              {nameError ? (
                <p className="font-mono text-xs text-red-400 mt-1.5">
                  {nameError}
                </p>
              ) : (
                <p className="font-mono text-xs text-gray-700 mt-1.5">
                  Room URL →{" "}
                  <span className="text-gray-600">
                    /room/
                    {form.name ? toSlug(form.name) || "..." : "..."}
                  </span>
                </p>
              )}
            </div>

            {/* description */}
            <div>
              <label className="font-mono text-xs text-gray-500 tracking-widest block mb-2">
                DESCRIPTION{" "}
                <span className="text-gray-700 font-normal normal-case tracking-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What are we building today?"
                maxLength={200}
                className="input-field"
              />
            </div>

            {/* language */}
            <div>
              <label className="font-mono text-xs text-gray-500 tracking-widest block mb-2">
                LANGUAGE
              </label>
              <select
                value={form.language}
                onChange={(e) =>
                  setForm((f) => ({ ...f, language: e.target.value }))
                }
                className="input-field bg-[#0d1117] cursor-pointer"
              >
                {LANGUAGES.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* max users */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-mono text-xs text-gray-500 tracking-widest">
                  MAX USERS
                </label>
                <span className="font-mono text-xs text-cyan-400">
                  {form.maxUsers} developers
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={1}
                value={form.maxUsers}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxUsers: Number(e.target.value),
                  }))
                }
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between font-mono text-xs text-gray-600 mt-1.5">
                <span>2</span>
                <span>20</span>
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={isCreating || !form.name.trim()}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-[#0d1117] font-mono font-bold py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              <Plus size={16} />
              {isCreating ? "Creating room..." : "Create Room"}
            </button>

          </form>
        </CodeWindow>

        <p className="text-center font-mono text-xs text-gray-700 mt-5">
          <Link to="/" className="hover:text-gray-500 transition-colors">
            ← Back to home
          </Link>
          <span className="mx-3 text-gray-800">|</span>
          <Link
            to="/join-room"
            className="hover:text-gray-500 transition-colors"
          >
            Join a room instead →
          </Link>
        </p>
      </div>
    </div>
  );
}