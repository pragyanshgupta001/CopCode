import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { Menu, X, Code2, LogOut, ChevronDown, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

=======
import { Menu, X, Code2, LogOut, ChevronDown, User, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useSocketStore } from "../store/useSocketStore";
import useRoomStore from "../store/useRoomStore";
// ── Avatar ────────────────────────────────────────────────────
>>>>>>> a4a12d9 (full project implementation)
function Avatar({ user, size = 28 }) {
  if (user?.profilePic) {
    return (
      <img
        src={user.profilePic}
        alt={user.fullName}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        className="border border-cyan-500/30"
      />
    );
  }
<<<<<<< HEAD
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #22d3ee, #a78bfa)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#0d1117",
        fontFamily: "monospace",
        fontWeight: 700,
        fontSize: size * 0.36,
        flexShrink: 0,
      }}
    >
      {user?.fullName ? getInitials(user.fullName) : <User size={size * 0.5} />}
=======
  const initials = (user?.fullName || "")
    .split(" ").filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg,#22d3ee,#a78bfa)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#0d1117", fontFamily: "monospace", fontWeight: 700,
        fontSize: size * 0.36, flexShrink: 0,
      }}
    >
      {initials || <User size={size * 0.5} />}
>>>>>>> a4a12d9 (full project implementation)
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
<<<<<<< HEAD
  const dropRef = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Pull auth state and logout action directly from the store
  const { authUser, logout } = useAuthStore();

  /* ── Scroll detection ─────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close menus on route change ──────────────────────────── */
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [pathname]);

  /* ── Close profile dropdown on outside click ──────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Logout: calls store action (handles API + toast) ─────── */
  const handleLogout = async () => {
    await logout();
    setDropOpen(false);
    setMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "About",   to: "/about"   },
    { label: "Blogs",   to: "/blogs"   },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d1117]/95 backdrop-blur-md border-b border-[#1e2a3a] shadow-lg shadow-black/30"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ── Logo ──────────────────────────────────────────────── */}
=======
  const dropRef   = useRef(null);
  const { pathname } = useLocation();
  const navigate  = useNavigate();

  const { authUser, logout }  = useAuthStore();
  const { socket }            = useSocketStore();
  const { disconnectSocket }  = useSocketStore();
  const { clearCurrentRoom }  = useRoomStore();

  // close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // close menu on route change
  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [pathname]);

  // socket: emit userUpdated when profile changes so rooms update presence
  useEffect(() => {
    if (!socket || !authUser) return;
    socket.emit("user:updated", {
      userId:     authUser._id,
      fullName:   authUser.fullName,
      profilePic: authUser.profilePic,
    });
  }, [authUser?.fullName, authUser?.profilePic, socket]);

  const NAV_LINKS = [
    { to: "/",        label: "Home"    },
    { to: "/about",   label: "About"   },
    { to: "/blogs",   label: "Blogs"   },
    { to: "/contact", label: "Contact" },
    ...(authUser ? [{ to: "/my-rooms", label: "My Rooms" }] : []),
  ];

  const handleLogout = async () => {
    setDropOpen(false);
    disconnectSocket();
    clearCurrentRoom();
    await logout();
    navigate("/login");
  };

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-[#0d1117]/95 backdrop-blur-md border-b border-[#1e2a3a] shadow-lg shadow-black/30" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* logo */}
>>>>>>> a4a12d9 (full project implementation)
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#0e2233] border border-cyan-500/30 group-hover:border-cyan-400/60 transition-colors">
            <Code2 size={18} className="text-cyan-400" />
          </div>
          <span className="font-mono font-bold text-lg text-white tracking-tight">
            Cop<span className="text-cyan-400">Code</span>
          </span>
        </Link>

<<<<<<< HEAD
        {/* ── Desktop nav links ─────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
=======
        {/* desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
>>>>>>> a4a12d9 (full project implementation)
              to={to}
              className={`font-mono text-sm px-4 py-2 rounded-lg transition-all duration-200 ${
                pathname === to
                  ? "text-cyan-400 bg-cyan-500/[0.08]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

<<<<<<< HEAD
        {/* ── Desktop right side ────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {authUser ? (
            /* ── Logged in: profile chip + dropdown ─────────────── */
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen((v) => !v)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#1e2a3a] bg-[#161b22] hover:border-cyan-500/30 hover:bg-[#1c2333] transition-all duration-200"
              >
                <Avatar user={authUser} size={28} />
                <span className="font-mono text-sm text-white max-w-[130px] truncate">
                  {authUser.fullName}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-500 transition-transform duration-200 ${
                    dropOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ── Dropdown ─────────────────────────────────────── */}
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#161b22] border border-[#1e2a3a] rounded-xl overflow-hidden shadow-2xl shadow-black/50 animate-fade-in">

                  {/* User info */}
                  <div className="px-4 py-3.5 border-b border-[#1e2a3a]">
                    <div className="flex items-center gap-3">
                      <Avatar user={authUser} size={40} />
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-bold text-white truncate">
                          {authUser.fullName}
                        </p>
                        <p className="font-mono text-xs text-gray-500 truncate">
                          {authUser.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="py-1">
=======
        {/* right side */}
        <div className="flex items-center gap-3">
          {authUser ? (
            <>
              {/* profile dropdown */}
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#1e2a3a] bg-[#161b22] hover:border-cyan-500/30 hover:bg-[#1c2333] transition-all duration-200"
                >
                  <Avatar user={authUser} size={24} />
                  <span className="font-mono text-sm text-white max-w-[130px] truncate hidden sm:block">
                    {authUser.fullName}
                  </span>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#161b22] border border-[#1e2a3a] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                    <div className="px-4 py-3 border-b border-[#1e2a3a]">
                      <p className="font-mono text-sm font-bold text-white truncate">{authUser.fullName}</p>
                      <p className="font-mono text-xs text-gray-500 truncate">{authUser.email}</p>
                    </div>
>>>>>>> a4a12d9 (full project implementation)
                    <Link
                      to="/profile"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 font-mono text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
<<<<<<< HEAD
                      <User size={14} className="text-gray-500" />
                      My Profile
                    </Link>

                    <div className="my-1 border-t border-[#1e2a3a]" />

=======
                      <User size={14} />
                      Profile
                    </Link>
                    <Link
                      to="/my-rooms"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 font-mono text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard size={14} />
                      My Rooms
                    </Link>
                    <div className="border-t border-[#1e2a3a]" />
>>>>>>> a4a12d9 (full project implementation)
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 font-mono text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                    >
                      <LogOut size={14} />
<<<<<<< HEAD
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── Logged out: Login link ──────────────────────────── */
=======
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
>>>>>>> a4a12d9 (full project implementation)
            <Link
              to="/login"
              className="font-mono text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
            >
              Login
            </Link>
          )}
<<<<<<< HEAD
        </div>

        {/* ── Mobile menu toggle ────────────────────────────────── */}
        <button
          className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile dropdown ───────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d1117]/98 backdrop-blur-md border-t border-[#1e2a3a] px-6 py-5 flex flex-col gap-1 animate-fade-in">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={`font-mono text-sm py-2.5 px-3 rounded-lg transition-colors ${
                pathname === to
                  ? "text-cyan-400 bg-cyan-500/[0.08]"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
=======

          {/* mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0d1117]/98 backdrop-blur-md border-t border-[#1e2a3a] px-6 py-5 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`font-mono text-sm py-2.5 px-3 rounded-lg transition-colors ${
                pathname === to ? "text-cyan-400 bg-cyan-500/[0.08]" : "text-gray-400 hover:text-white"
>>>>>>> a4a12d9 (full project implementation)
              }`}
            >
              {label}
            </Link>
          ))}
<<<<<<< HEAD

          <div className="pt-3 mt-2 border-t border-[#1e2a3a]">
            {authUser ? (
              /* ── Mobile logged in ─────────────────────────────── */
              <div className="flex flex-col gap-1">
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
                  <Avatar user={authUser} size={38} />
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold text-white truncate">
                      {authUser.fullName}
                    </p>
                    <p className="font-mono text-xs text-gray-500 truncate">
                      {authUser.email}
                    </p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 font-mono text-sm text-gray-300 hover:text-white py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <User size={14} className="text-gray-500" />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 font-mono text-sm text-red-400 hover:text-red-300 py-2.5 px-3 rounded-lg hover:bg-red-500/5 transition-colors w-full"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            ) : (
              /* ── Mobile logged out ────────────────────────────── */
              <Link
                to="/login"
                className="font-mono text-sm text-gray-400 hover:text-white py-2 px-3 block"
              >
                Login
              </Link>
            )}
          </div>
=======
          {authUser && (
            <>
              <div className="border-t border-[#1e2a3a] my-2" />
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar user={authUser} size={36} />
                <div>
                  <p className="font-mono text-sm font-bold text-white">{authUser.fullName}</p>
                  <p className="font-mono text-xs text-gray-500">{authUser.email}</p>
                </div>
              </div>
              <Link to="/profile"  className="font-mono text-sm text-gray-400 hover:text-white py-2.5 px-3 rounded-lg">Profile</Link>
              <Link to="/my-rooms" className="font-mono text-sm text-gray-400 hover:text-white py-2.5 px-3 rounded-lg">My Rooms</Link>
              <button onClick={handleLogout} className="text-left font-mono text-sm text-red-400 py-2.5 px-3 rounded-lg">Log out</button>
            </>
          )}
>>>>>>> a4a12d9 (full project implementation)
        </div>
      )}
    </nav>
  );
}
