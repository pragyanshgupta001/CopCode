import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Play, Square, Trash2, Terminal } from "lucide-react";
import { axiosInstance } from "../../../lib/axios";

let LINE_COUNTER = 0;
function nextId() { return ++LINE_COUNTER; }

const STATUS_MAP = {
  3:  { label: "Accepted", ok: true  },
  4:  { label: "Wrong Answer", ok: false },
  5:  { label: "Time Limit Exceeded", ok: false },
  6:  { label: "Compilation Error", ok: false },
  7:  { label: "Runtime Error (SIGSEGV)", ok: false },
  8:  { label: "Runtime Error (SIGXFSZ)", ok: false },
  9:  { label: "Runtime Error (SIGFPE)", ok: false },
  10: { label: "Runtime Error (SIGABRT)", ok: false },
  11: { label: "Runtime Error (NZEC)", ok: false },
  12: { label: "Runtime Error", ok: false },
  13: { label: "Internal Error", ok: false },
};

const LANG_LABELS = {
  javascript: "Node.js", typescript: "TypeScript",
  python: "Python 3", cpp: "C++ (GCC)", c: "C (GCC)",
  java: "Java", rust: "Rust", go: "Go",
  ruby: "Ruby", kotlin: "Kotlin", swift: "Swift",
};

function langFromFile(file) {
  if (!file) return null;
  const ext = file.name?.split(".").pop()?.toLowerCase();
  const m = { js:"javascript",jsx:"javascript",ts:"typescript",tsx:"typescript",py:"python",cpp:"cpp",cc:"cpp",c:"c",java:"java",rs:"rust",go:"go",rb:"ruby",kt:"kotlin",swift:"swift" };
  return m[ext] || file.language || null;
}

export default function TerminalPanel({
  open, onToggle, height,
  activeMainFile,
  activeWorkspaceFile,
  getMainContent,
  getWorkspaceContent,
}) {
  const [mode, setMode] = useState("room");
  const [lines, setLines] = useState([]);
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [showStdin, setShowStdin] = useState(false);
  const outputRef = useRef(null);

  const activeFile = mode === "room" ? activeMainFile : activeWorkspaceFile;
  const modeColor = mode === "workspace" ? "#a78bfa" : "#22d3ee";
  const detectedLang = langFromFile(activeFile);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = useCallback((type, text) => {
    setLines((prev) => [...prev, { id: nextId(), type, text }]);
  }, []);

  const addLines = useCallback((type, text) => {
    if (!text?.trim()) return;
    text.trim().split("\n").forEach((line) => {
      setLines((prev) => [...prev, { id: nextId(), type, text: line }]);
    });
  }, []);

  const clearTerminal = () => setLines([]);

  const runCode = useCallback(async () => {
    if (running) return;

    if (!activeFile) {
      addLine("err", "No file selected. Open a file in the editor first.");
      return;
    }
    if (!detectedLang) {
      addLine("err", `Unknown language for: ${activeFile.name}`);
      return;
    }

    const code = mode === "room"
      ? (getMainContent?.() ?? activeFile.content ?? "")
      : (getWorkspaceContent?.() ?? activeFile.content ?? "");

    if (!code.trim()) {
      addLine("err", "File is empty. Add some code first.");
      return;
    }

    setRunning(true);
    addLine("cmd",  `${activeFile.name} [${LANG_LABELS[detectedLang] || detectedLang}]`);
    if (stdin.trim()) addLine("info", `stdin: ${stdin.slice(0, 60)}${stdin.length > 60 ? "..." : ""}`);
    addLine("info", "Compiling and executing...");

    try {
      const response = await axiosInstance.post("/execute", {
        code,
        language: detectedLang,
        stdin:    stdin || "",
        filename: activeFile.name,
      });

      const { stdout, stderr, compile_output, status, time, memory } = response.data;

      if (compile_output?.trim()) {
        addLine("err-head", "── Compilation Error ──");
        addLines("err", compile_output);
      }
      if (stdout?.trim()) {
        addLine("out-head", "── Output ──");
        addLines("out", stdout);
      }
      if (stderr?.trim()) {
        addLine("err-head", "── Stderr ──");
        addLines("err", stderr);
      }
      if (!stdout?.trim() && !stderr?.trim() && !compile_output?.trim() && status?.id === 3) {
        addLine("out", "(no output)");
      }

      const st      = STATUS_MAP[status?.id] || { label: status?.description || "Unknown", ok: false };
      const timeStr = time   ? ` · ${time}s`                     : "";
      const memStr  = memory ? ` · ${Math.round(memory / 1024)}MB` : "";
      addLine("status-" + (st.ok ? "ok" : "err"), `${st.label}${timeStr}${memStr}`);

    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Execution failed";
      if (err?.response?.status === 504) {
        addLine("err", "Gateway timeout — the code execution service is slow. Try again.");
      } else {
        addLine("err", `Error: ${msg}`);
      }
    } finally {
      setRunning(false);
    }
  }, [running, activeFile, detectedLang, mode, stdin, getMainContent, getWorkspaceContent, addLine, addLines]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && open) {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runCode, open]);

  return (
    <div
      className="flex flex-col bg-[#0d1117] border-t border-[#30363d] flex-shrink-0 overflow-hidden transition-all duration-150"
      style={{ height: open ? height : 32 }}
    >
      {/* header */}
      <div className="h-8 flex items-center gap-2 px-3 border-b border-[#30363d] flex-shrink-0 bg-[#161b22] select-none">
        <Terminal size={11} className="text-gray-600" />
        <span className="font-mono text-[9px] text-gray-600 tracking-widest">TERMINAL</span>

        <div className="flex gap-0.5 ml-1">
          {["room", "workspace"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors ${
                mode === m ? "bg-[#21262d] border-[#30363d]" : "text-gray-600 hover:text-gray-400 border-transparent"
              }`}
              style={{ color: mode === m ? modeColor : undefined }}
            >
              {m === "room" ? "Main Editor" : "Workspace"}
            </button>
          ))}
        </div>

        {open && activeFile && (
          <span className="font-mono text-[10px] text-gray-600 ml-1 truncate max-w-[120px]">
            {activeFile.name}{detectedLang && <span className="opacity-60"> · {detectedLang}</span>}
          </span>
        )}

        {open && (
          <>
            <button
              onClick={() => setShowStdin(!showStdin)}
              className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors ml-1 ${
                showStdin ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/5" : "text-gray-600 border-transparent hover:text-gray-400"
              }`}
              title="Toggle stdin input"
            >
              stdin
            </button>

            <button
              onClick={runCode}
              disabled={running || !activeFile}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded border font-mono text-[10px] transition-colors ${
                running
                  ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/5 cursor-not-allowed"
                  : activeFile
                    ? "text-green-400 border-green-500/30 bg-green-500/5 hover:bg-green-500/15"
                    : "text-gray-600 border-gray-700 cursor-not-allowed opacity-50"
              }`}
              title="Run (Ctrl+Enter)"
            >
              {running ? <><Square size={9} className="animate-pulse" /> Running...</> : <><Play size={9} /> Run</>}
            </button>

            <button onClick={clearTerminal} className="text-gray-600 hover:text-gray-400 transition-colors ml-1" title="Clear">
              <Trash2 size={12} />
            </button>
          </>
        )}

        <button onClick={onToggle} className="ml-auto text-gray-600 hover:text-gray-300 transition-colors" title={open ? "Collapse" : "Expand"}>
          {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* stdin */}
      {open && showStdin && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
          <span className="font-mono text-[9px] text-gray-600 flex-shrink-0">STDIN</span>
          <textarea
            rows={2}
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter program input here (each line = one input)..."
            className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-cyan-500/40 rounded px-2 py-1 font-mono text-[11px] text-white placeholder-gray-700 outline-none resize-none leading-relaxed transition-colors"
          />
        </div>
      )}

      {/* output */}
      {open && (
        <div ref={outputRef} className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-6">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-6 select-none">
              <Terminal size={20} className="text-gray-700 mb-2" />
              <p className="text-gray-700 text-[10px]">
                {activeFile ? `${activeFile.name} · press Run or Ctrl+Enter` : "Open a file, then click Run"}
              </p>
            </div>
          ) : (
            lines.map((line) => <OutputLine key={line.id} line={line} modeColor={modeColor} />)
          )}
        </div>
      )}
    </div>
  );
}

function OutputLine({ line, modeColor }) {
  const { type, text } = line;
  if (type === "cmd")       return <div className="flex gap-2 py-0.5"><span style={{ color: modeColor }}>$</span><span className="text-white break-all">{text}</span></div>;
  if (type === "out")       return <div className="text-green-300 break-all whitespace-pre-wrap pl-4 py-0.5">{text}</div>;
  if (type === "out-head")  return <div className="text-green-500/70 text-[9px] tracking-widest mt-1 py-0.5">{text}</div>;
  if (type === "err")       return <div className="text-red-400 break-all whitespace-pre-wrap pl-4 py-0.5">{text}</div>;
  if (type === "err-head")  return <div className="text-red-500/70 text-[9px] tracking-widest mt-1 py-0.5">{text}</div>;
  if (type === "info")      return <div className="text-gray-500 text-[10px] italic py-0.5 pl-4">{text}</div>;
  if (type === "status-ok") return <div className="text-green-400 text-[10px] border-t border-[#21262d] mt-1 pt-1">── {text}</div>;
  if (type === "status-err")return <div className="text-red-400   text-[10px] border-t border-[#21262d] mt-1 pt-1">── {text}</div>;
  return <div className="text-gray-400 py-0.5">{text}</div>;
}