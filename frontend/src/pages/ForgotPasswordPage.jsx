import { useState } from "react";
import { Link } from "react-router-dom";
import { Code2, Mail, ArrowLeft, Loader2, CheckCircle2, Calendar, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore();
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !dob || !newPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const res = await forgotPassword({
      email: email.trim(),
      dob,
      newPassword,
    });
    setLoading(false);
    if (res) setDone(true);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* logo */}
        <Link to="/login" className="flex items-center gap-2.5 justify-center mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-[#0e2233] border border-cyan-500/30 flex items-center justify-center">
            <Code2 size={20} className="text-cyan-400" />
          </div>
          <span className="font-mono font-bold text-xl text-white">
            Cop<span className="text-cyan-400">Code</span>
          </span>
        </Link>

        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
          {/* title bar */}
          <div className="px-6 pt-6 pb-4 border-b border-[#30363d]">
            <p className="font-mono text-[10px] text-cyan-400 tracking-widest mb-1">
              // auth.forgot_password
            </p>
            <h1 className="font-mono font-bold text-xl text-white">Forgot Password</h1>
          </div>

          <div className="px-6 py-6">
            {done ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 size={40} className="text-green-400 mx-auto" />
                <p className="font-mono text-white font-semibold">Password changed!</p>
                <p className="font-mono text-sm text-gray-500">
                  Your password has been reset after DOB verification.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="font-mono text-sm text-gray-500">
                  Verify your account with email and DOB to set a new password.
                </p>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest block">EMAIL</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-[#0d1117] border border-[#30363d] focus:border-cyan-500/50 rounded-lg pl-9 pr-3 py-2.5 font-mono text-sm text-white placeholder-gray-700 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest block">DATE OF BIRTH</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] focus:border-cyan-500/50 rounded-lg pl-9 pr-3 py-2.5 font-mono text-sm text-white outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest block">NEW PASSWORD</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full bg-[#0d1117] border border-[#30363d] focus:border-cyan-500/50 rounded-lg pl-9 pr-10 py-2.5 font-mono text-sm text-white placeholder-gray-700 outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-gray-500 tracking-widest block">CONFIRM PASSWORD</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-[#0d1117] border border-[#30363d] focus:border-cyan-500/50 rounded-lg pl-9 pr-3 py-2.5 font-mono text-sm text-white placeholder-gray-700 outline-none"
                      required
                    />
                  </div>
                </div>
                {error && <p className="font-mono text-[11px] text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#0d1117] font-mono font-bold text-sm transition-colors"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                  {loading ? "Verifying..." : "Verify & Change Password"}
                </button>
              </form>
            )}
          </div>
        </div>

        <Link
          to="/login"
          className="flex items-center gap-2 justify-center mt-5 font-mono text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to login
        </Link>
      </div>
    </div>
  );
}
