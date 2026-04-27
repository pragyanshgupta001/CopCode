import { useState, useRef } from "react";
import { Link }              from "react-router-dom";
import {
  Code2, Camera, User, Mail, Calendar, GraduationCap,
  FileText, Lock, Eye, EyeOff, Save, Loader2, CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function Avatar({ user, size = 80, preview = null }) {
  const src = preview || user?.profilePic;
  if (src) {
    return (
      <img
        src={src}
        alt={user?.fullName}
        className="rounded-full object-cover border-2 border-cyan-500/40"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = (user?.fullName || "")
    .split(" ").filter(Boolean).slice(0, 2)
    .map((w) => w[0].toUpperCase()).join("");

  return (
    <div
      className="rounded-full flex items-center justify-center font-mono font-bold text-[#0d1117] border-2 border-cyan-500/40 flex-shrink-0"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg,#22d3ee,#a78bfa)",
        fontSize: size * 0.35,
      }}
    >
      {initials || <User size={size * 0.45} />}
    </div>
  );
}

function Section({ title, comment, children }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[#30363d] flex items-center gap-2">
        <span className="font-mono text-[10px] text-cyan-400 tracking-widest">{comment}</span>
        <span className="font-mono text-sm font-semibold text-white">{title}</span>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function Field({ label, icon: Icon, error, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] text-gray-500 tracking-widest block">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
        )}
        <input
          {...props}
          className={`
            w-full bg-[#0d1117] border rounded-lg font-mono text-sm text-white
            placeholder-gray-700 outline-none transition-colors
            ${Icon ? "pl-9 pr-3" : "px-3"} py-2.5
            ${error
              ? "border-red-500/60 focus:border-red-400"
              : "border-[#30363d] focus:border-cyan-500/50"
            }
          `}
        />
      </div>
      {error && <p className="font-mono text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] text-gray-500 tracking-widest block">
        {label}
      </label>
      <textarea
        {...props}
        rows={3}
        className="w-full bg-[#0d1117] border border-[#30363d] focus:border-cyan-500/50 rounded-lg px-3 py-2.5 font-mono text-sm text-white placeholder-gray-700 outline-none transition-colors resize-none"
      />
    </div>
  );
}

function PasswordField({ label, value, onChange, error }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] text-gray-500 tracking-widest block">
        {label}
      </label>
      <div className="relative">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`
            w-full bg-[#0d1117] border rounded-lg font-mono text-sm text-white
            placeholder-gray-700 outline-none transition-colors pl-9 pr-10 py-2.5
            ${error ? "border-red-500/60" : "border-[#30363d] focus:border-cyan-500/50"}
          `}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
      {error && <p className="font-mono text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { authUser, updateProfile, uploadProfilePic, changePassword, isUpdating } = useAuthStore();

  const [form, setForm] = useState({
    fullName:    authUser?.fullName    || "",
    dob:         authUser?.dob ? authUser.dob.slice(0, 10) : "",
    education:   authUser?.education   || "",
    description: authUser?.description || "",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [preview, setPreview]   = useState(null);
  const [picFile, setPicFile]   = useState(null);
  const fileInputRef            = useRef(null);

  const [pwForm, setPwForm] = useState({
    oldPassword: "", newPassword: "", confirm: "",
  });
  const [pwErrors, setPwErrors]   = useState({});
  const [pwSaved, setPwSaved]     = useState(false);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handlePicSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    let ok = true;

    if (picFile) {
      const url = await uploadProfilePic(picFile);
      if (!url) ok = false;
      else { setPicFile(null); }
    }

    if (ok) {
      ok = await updateProfile({
        fullName:    form.fullName,
        dob:         form.dob || null,
        education:   form.education,
        description: form.description,
      });
    }

    if (ok) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.oldPassword)         errs.oldPassword = "Required";
    if (!pwForm.newPassword)         errs.newPassword = "Required";
    else if (pwForm.newPassword.length < 6) errs.newPassword = "At least 6 characters";
    if (pwForm.newPassword !== pwForm.confirm) errs.confirm = "Passwords do not match";
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    const ok = await changePassword(pwForm.oldPassword, pwForm.newPassword);
    if (ok) {
      setPwForm({ oldPassword: "", newPassword: "", confirm: "" });
      setPwErrors({});
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">

      <div className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center px-6 gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <Code2 size={16} className="text-cyan-400" />
          <span className="font-mono font-bold text-white">
            Cop<span className="text-cyan-400">Code</span>
          </span>
        </Link>
        <span className="text-[#30363d]">/</span>
        <span className="font-mono text-sm text-gray-400">Profile</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        <Section title="Profile" comment="// user.profile">
          <form onSubmit={handleSaveProfile} className="space-y-5">

            {/* avatar */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar user={authUser} size={72} preview={preview} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center transition-colors shadow-lg"
                  title="Change picture"
                >
                  <Camera size={13} className="text-[#0d1117]" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePicSelect}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-mono text-white font-semibold">{authUser?.fullName}</p>
                <p className="font-mono text-xs text-gray-500">{authUser?.email}</p>
                {preview && (
                  <p className="font-mono text-[10px] text-cyan-400 mt-0.5">New image selected — save to apply</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="FULL NAME"
                icon={User}
                value={form.fullName}
                onChange={setField("fullName")}
                placeholder="Your full name"
              />
              <Field
                label="EMAIL"
                icon={Mail}
                value={authUser?.email}
                disabled
                className="opacity-50 cursor-not-allowed"
                placeholder="Email cannot be changed"
              />
              <Field
                label="DATE OF BIRTH"
                icon={Calendar}
                type="date"
                value={form.dob}
                onChange={setField("dob")}
              />
              <Field
                label="EDUCATION"
                icon={GraduationCap}
                value={form.education}
                onChange={setField("education")}
                placeholder="e.g. B.Tech Computer Science"
              />
            </div>

            <TextArea
              label="BIO / DESCRIPTION"
              value={form.description}
              onChange={setField("description")}
              placeholder="Tell your team about yourself..."
            />

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#0d1117] font-mono text-sm font-bold transition-colors"
              >
                {isUpdating
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Save size={14} />
                }
                {isUpdating ? "Saving..." : "Save Profile"}
              </button>
              {profileSaved && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-green-400">
                  <CheckCircle2 size={13} />
                  Saved!
                </div>
              )}
            </div>
          </form>
        </Section>

        <Section title="Change Password" comment="// user.security">
          <form onSubmit={handleSavePassword} className="space-y-4">
            <PasswordField
              label="CURRENT PASSWORD"
              value={pwForm.oldPassword}
              onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })}
              error={pwErrors.oldPassword}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PasswordField
                label="NEW PASSWORD"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                error={pwErrors.newPassword}
              />
              <PasswordField
                label="CONFIRM NEW PASSWORD"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                error={pwErrors.confirm}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isUpdating}
                className="flex items-center gap-2 px-5 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 font-mono text-sm transition-colors"
              >
                <Lock size={13} />
                Update Password
              </button>
              {pwSaved && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-green-400">
                  <CheckCircle2 size={13} />
                  Password changed!
                </div>
              )}
            </div>
          </form>
        </Section>

        <Section title="Account Info" comment="// user.meta">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Member since", value: authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : "—" },
              { label: "Email", value: authUser?.email },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#0d1117] rounded-lg px-3 py-2.5">
                <p className="font-mono text-[9px] text-gray-600 tracking-widest mb-1">{label.toUpperCase()}</p>
                <p className="font-mono text-sm text-gray-300 truncate">{value}</p>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  );
}
