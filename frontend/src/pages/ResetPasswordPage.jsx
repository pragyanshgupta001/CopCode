import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Code2, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuthStore();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (pw.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (pw !== confirm) { setError("Passwords do not match"); return; }

    setLoading(true);
    const ok = await resetPassword(token, pw);
    setLoading(false);

    if (ok) {
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <Link to="/login" className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#0e2233] border border-cyan-500/30 flex items-center justify-center">
            <Code2 size={20} className="text-cyan-400" />
          </div>
          <span className="font-mono font-bold text-xl text-white">
            Cop<span className="text-cyan-400">Code</span>
          </span>
        </Link>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-[#30363d]">
            <p className="font-mono text-[10px] text-cyan-400 tracking-widest mb-1">
              // auth.reset_password
            </p>
            <h1 className="font-mono font-bold text-xl text-white">Reset Password</h1>
          </div>

          <div className="px-6 py-6">
            {done ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 size={40} className="text-green-400 mx-auto" />
                <p className="font-mono text-white font-semibold">Password reset!</p>
                <p className="font-mono text-sm text-gray-500">Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* new password */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest block">NEW PASSWORD</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full bg-[#0d1117] border border-[#30363d] focus:border-cyan-500/50 rounded-lg pl-9 pr-10 py-2.5 font-mono text-sm text-white placeholder-gray-700 outline-none"
                      required
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300">
                      {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {/* confirm */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest block">CONFIRM PASSWORD</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type={showPw ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-[#0d1117] border border-[#30363d] focus:border-cyan-500/50 rounded-lg pl-9 pr-3 py-2.5 font-mono text-sm text-white placeholder-gray-700 outline-none"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="font-mono text-[11px] text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#0d1117] font-mono font-bold text-sm transition-colors"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
