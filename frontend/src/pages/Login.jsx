import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {useAuthStore} from "../store/useAuthStore"
import { Code2, Eye, EyeOff, Github } from "lucide-react";
import CodeWindow from "../components/CodeWindow";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", dob: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const {signup,login,isSigningUp,isLoggingIn} = useAuthStore();

   const validateForm = () => {
  if (tab === "signup" && !formData.fullName.trim()) {
    return toast.error("Full name is required");
  }
  if (tab === "signup" && !formData.dob) {
    return toast.error("Date of birth is required");
  }

  if (!formData.email.trim()) return toast.error("Email is required");
  if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");

  if (!formData.password) return toast.error("Password is required");
  if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

  return true;
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  const valid = validateForm();
  if (!valid) return;

  if (tab === "login") {
  const success = await login({
    email: formData.email,
    password: formData.password
  });

  if (success) navigate("/");
} 
else {
  const success = await signup(formData);

  if (success) navigate("/");
}};

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-[#0e2233] border border-cyan-500/30 group-hover:border-cyan-400/60 flex items-center justify-center transition-colors">
            <Code2 size={20} className="text-cyan-400" />
          </div>
          <span className="font-mono font-bold text-xl text-white">
            Cop<span className="text-cyan-400">Code</span>
          </span>
        </Link>

        <CodeWindow filename="auth.jsx" className="shadow-2xl">

          {/* Tabs */}
          <div className="flex border-b border-[#1e2a3a]">
            {["login", "signup"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setErrors({}); }}
                className={`flex-1 font-mono text-sm py-3.5 transition-all duration-200 ${
                  tab === t
                    ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/3"
                }`}
              >
                {t === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-7 space-y-5">
            <p className="font-mono text-xs text-gray-600">
              {tab === "login" ? "// Welcome back, developer" : "// Create your account"}
            </p>

            {/* Username — signup only */}
            {tab === "signup" && (
              <div>
                <label className="font-mono text-xs text-gray-500 tracking-widest block mb-2">FULLNAME</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="your_fullname"
                  className={`input-field ${errors.fullName ? "border-red-500/60" : ""}`}
                />
                {errors.fullName && <p className="font-mono text-xs text-red-400 mt-1">{errors.fullName}</p>}
              </div>
            )}

            {tab === "signup" && (
              <div>
                <label className="font-mono text-xs text-gray-500 tracking-widest block mb-2">DATE OF BIRTH</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="input-field"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="font-mono text-xs text-gray-500 tracking-widest block mb-2">EMAIL</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>  setFormData({ ...formData, email: e.target.value })}
                placeholder="dev@example.com"
                className={`input-field ${errors.email ? "border-red-500/60" : ""}`}
              />
              {errors.email && <p className="font-mono text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="font-mono text-xs text-gray-500 tracking-widest block mb-2">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={`input-field pr-11 ${errors.password ? "border-red-500/60" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="font-mono text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn || isSigningUp}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-[#0d1117] font-mono font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              {
  tab === "login"
    ? (isLoggingIn ? "Authenticating..." : "Login →")
    : (isSigningUp ? "Creating Account..." : "Create Account →")
}
            </button>
            {tab === "login" && (
              <div className="text-right -mt-2">
                <Link
                  to="/forgot-password"
                  className="font-mono text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            
            
          </form>
        </CodeWindow>

        <p className="text-center font-mono text-xs text-gray-700 mt-5">
          <Link to="/" className="hover:text-gray-500 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
