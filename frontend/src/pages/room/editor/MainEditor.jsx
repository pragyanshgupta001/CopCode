import { useState, useRef, useEffect, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { X, Save } from "lucide-react";
import { getFileIcon, getFileIconColor } from "../utils/fileIcons";

const MONACO_THEME = {
  base: "vs-dark", inherit: true,
  rules: [
    { token: "comment", foreground: "6e7681", fontStyle: "italic" },
    { token: "keyword", foreground: "ff7b72" },
    { token: "string", foreground: "a5d6ff" },
    { token: "number", foreground: "79c0ff" },
    { token: "function", foreground: "d2a8ff" },
    { token: "type", foreground: "ffa657" },
  ],
  colors: {
    "editor.background": "#0d1117",
    "editor.foreground": "#e6edf3",
    "editor.lineHighlightBackground": "#161b22",
    "editor.selectionBackground": "#1f3a5f",
    "editorLineNumber.foreground": "#3d4450",
    "editorLineNumber.activeForeground": "#6e7681",
    "editorCursor.foreground": "#22d3ee",
    "editorIndentGuide.background": "#21262d",
    "editorBracketMatch.border": "#22d3ee",
    "scrollbarSlider.background": "#30363d88",
    "minimap.background": "#0d1117",
  },
};

const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  fontLigatures: true,
  lineHeight: 22,
  wordWrap: "on",
  minimap: { enabled: true, scale: 1 },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true, indentation: true },
  formatOnPaste: true,
  tabSize: 2,
  insertSpaces: true,
  folding: true,
  renderLineHighlight: "gutter",
  scrollbar: { vertical: "auto", horizontal: "auto", verticalScrollbarSize: 8 },
  padding: { top: 12, bottom: 12 },
  mouseWheelZoom: true,
};

const LANG_MAP = {
  js:"javascript", jsx:"javascript", ts:"typescript", tsx:"typescript",
  py:"python", rs:"rust", go:"go", java:"java", cpp:"cpp", c:"c",
  rb:"ruby", kt:"kotlin", swift:"swift", css:"css", scss:"scss",
  html:"html", json:"json", md:"markdown", yaml:"yaml", yml:"yaml",
  sh:"shell", sql:"sql", xml:"xml", txt:"plaintext",
};

function getMonacoLanguage(filename) {
  return LANG_MAP[filename?.split(".").pop()?.toLowerCase()] || "plaintext";
}

//Tab Bar
function TabBar({ tabs, activeFile, onSwitchTab, onCloseTab }) {
  if (!tabs.length) return null;
  return (
    <div className="flex items-end bg-[#161b22] border-b border-[#30363d] overflow-x-auto flex-shrink-0 h-9">
      {tabs.map((tab) => {
        const isActive = activeFile?.path === tab.path;
        return (
          <div
            key={tab.path}
            onClick={() => onSwitchTab(tab)}
            className={`flex items-center gap-1.5 px-3 h-full min-w-0 max-w-[160px] border-r border-[#30363d] cursor-pointer flex-shrink-0 group transition-colors select-none ${
              isActive ? "bg-[#0d1117] text-white" : "bg-[#161b22] text-gray-400 hover:bg-[#1c2333]"
            }`}
            style={{ borderTop: isActive ? "1px solid #22d3ee" : "1px solid transparent" }}
          >
            {tab.unsaved
              ? <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              : <span className="font-mono text-[9px] font-bold flex-shrink-0" style={{ color: getFileIconColor(tab.name) }}>{getFileIcon(tab.name)}</span>
            }
            <span className="font-mono text-[11px] truncate">{tab.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onCloseTab(tab); }}
              className="flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
            ><X size={10} /></button>
          </div>
        );
      })}
    </div>
  );
}

export default function MainEditor({
  activeFile, tabs, onCloseTab, onSwitchTab,
  autoSave, socket, roomId, contentRef,
}) {
  const [unsavedFiles, setUnsavedFiles] = useState(new Set());
  const [editorReady, setEditorReady]   = useState(false);

  const editorRef      = useRef(null);
  const monacoRef      = useRef(null);
  const bindingRef     = useRef(null);
  const ydocRef        = useRef(null);
  const ytextRef       = useRef(null);
  const activePathRef  = useRef(null);
  const autoSaveTimer  = useRef(null);

  useEffect(() => {
    if (!contentRef) return;
    contentRef.current = () => {
      const ytext = ytextRef.current;
      if (ytext) {
        try { return ytext.toString(); } catch { /* fall through */ }
      }
      const editor = editorRef.current;
      if (editor && typeof editor.getValue === "function") {
        try { return editor.getValue() || ""; } catch { /* fall through */ }
      }
      return activeFile?.content || "";
    };
  }, []);

  const buildTeardown = useCallback((
    ydoc, binding, socket, handlers
  ) => {
    let cleaned = false;
    return () => {
      if (cleaned) return;
      cleaned = true;
      // Remove all socket listeners for this file
      if (socket && handlers) {
        const { step1Reply, step2Request, update, overwrite } = handlers;
        try { socket.off("editor:sync-step1-reply",   step1Reply);   } catch { /* ignore */ }
        try { socket.off("editor:sync-step2-request", step2Request); } catch { /* ignore */ }
        try { socket.off("editor:update",             update);       } catch { /* ignore */ }
        try { socket.off("editor:overwrite",          overwrite);    } catch { /* ignore */ }
      }
      // Remove Yjs update listener
      // (handlers.yjsUpdate is on the ydoc that may already be destroyed)
      if (ydoc && handlers?.yjsUpdate) {
        try { ydoc.off("update", handlers.yjsUpdate); } catch { /* ignore */ }
      }
      // Destroy MonacoBinding
      if (binding) {
        try { binding.destroy(); } catch { /* ignore */ }
      }
      // Destroy Y.Doc
      if (ydoc) {
        try { ydoc.destroy(); } catch { /* ignore */ }
      }
      // Clear dangling refs
      ytextRef.current = null;
      ydocRef.current  = null;
    };
  }, []);

  // ── setupYjs: creates Y.Doc, binding, and socket listeners ─
  // Returns a teardown function — this is the ONLY teardown path.
  const setupYjs = useCallback((file) => {
    if (!file || !editorRef.current || !monacoRef.current) return null;

    activePathRef.current = file.path;

    const model = editorRef.current?.getModel?.();
    if (!model) return null;

    // Create Y.Doc + shared text
    const ydoc  = new Y.Doc();
    const ytext = ydoc.getText("content");
    ydocRef.current  = ydoc;
    ytextRef.current = ytext;

    // Update Monaco model language (without remounting)
    monacoRef.current.editor.setModelLanguage(
      model,
      getMonacoLanguage(file.name)
    );

    // Clear stale model text before binding.
    // MonacoBinding will initialize ytext/model sync from the current model state.
    model.setValue("");

    // Create MonacoBinding — links ytext ↔ Monaco bidirectionally
    // Do NOT call editor.setValue() — MonacoBinding owns content
    const binding = new MonacoBinding(
      ytext,
      model,
      new Set([editorRef.current]),
      null
    );
    bindingRef.current = binding;

    // Offline fallback
    if (!socket || !roomId) {
      if (file.content) ytext.insert(0, file.content);
      return buildTeardown(ydoc, binding, null, null);
    }

    // 2-step Yjs handshake
    // Step 1: send our state vector to server
    const sv = Y.encodeStateVector(ydoc);
    socket.emit("editor:sync-step1", {
      roomId,
      filePath: file.path,
      stateVector: Array.from(sv), // Array.from for Socket.io transport
    });

    // Define all handlers with path guard
    // Path guard: ignore events for files we no longer have open.
    const filePath = file.path; // captured in closure

    const step1Reply = ({ filePath: fp, update }) => {
      if (fp !== activePathRef.current) return;
      if (!update?.length) return;
      // new Uint8Array(Array) converts Socket.io array back to binary
      Y.applyUpdate(ydoc, new Uint8Array(update));
    };

    const step2Request = ({ filePath: fp, stateVector }) => {
      if (fp !== activePathRef.current) return;
      if (!stateVector?.length) return;
      const serverSV = new Uint8Array(stateVector);
      const missing  = Y.encodeStateAsUpdate(ydoc, serverSV);
      // Only send if we have something the server doesn't (>2 bytes = non-empty)
      if (missing.length > 2) {
        socket.emit("editor:sync-step2", {
          roomId,
          filePath: fp,
          update: Array.from(missing), // Array.from for Socket.io transport
        });
      }
    };

    const update = ({ filePath: fp, update: upd }) => {
      if (fp !== activePathRef.current) return;
      if (!upd?.length) return;
      // Apply with "remote" origin — prevents handleYjsUpdate re-emitting
      Y.applyUpdate(ydoc, new Uint8Array(upd), "remote");
    };

    const overwrite = ({ filePath: fp, update: upd }) => {
      if (fp !== activePathRef.current) return;
      if (!upd?.length) return;
      // Apply with "overwrite" origin — prevents re-emit echo
      Y.applyUpdate(ydoc, new Uint8Array(upd), "overwrite");
    };

    const yjsUpdate = (upd, origin) => {
      // Do NOT re-broadcast remote or overwrite updates
      if (origin === "remote" || origin === "overwrite") return;

      // Send incremental update to server
      socket.emit("editor:update", {
        roomId,
        filePath,
        update: Array.from(upd), // Array.from for Socket.io transport
      });

      setUnsavedFiles((prev) => new Set(prev).add(filePath));

      if (autoSave) {
        clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
          socket.emit("editor:save", { roomId, filePath });
          setUnsavedFiles((prev) => {
            const n = new Set(prev);
            n.delete(filePath);
            return n;
          });
        }, 600);
      }
    };

    // Register all listeners
    socket.on("editor:sync-step1-reply",   step1Reply);
    socket.on("editor:sync-step2-request", step2Request);
    socket.on("editor:update",             update);
    socket.on("editor:overwrite",          overwrite);
    ydoc.on("update", yjsUpdate);

    // Return teardown — called by useEffect cleanup (Bug 4 fix)
    return buildTeardown(ydoc, binding, socket, {
      step1Reply,
      step2Request,
      update,
      overwrite,
      yjsUpdate,
    });

  }, [socket, roomId, autoSave, buildTeardown]);

  // Monaco onMount
  const handleWillMount = (monaco) => {
    monaco.editor.defineTheme("copcode-dark", MONACO_THEME);
    monacoRef.current = monaco;
  };

  const handleDidMount = (editor) => {
    editorRef.current = editor;

    editor.addCommand(
      monacoRef.current?.KeyMod.CtrlCmd | monacoRef.current?.KeyCode.KeyS,
      () => {
        const path = activePathRef.current;
        if (path && socket && roomId) {
          socket.emit("editor:save", { roomId, filePath: path });
          setUnsavedFiles((prev) => { const n = new Set(prev); n.delete(path); return n; });
        }
      }
    );

    setEditorReady(true);
  };

  useEffect(() => {
    if (activeFile) return;
    // When editor is not rendered, guard against stale/disposed instance use.
    setEditorReady(false);
    editorRef.current = null;
    monacoRef.current = null;
  }, [activeFile]);

  // React calls the returned cleanup on:
  //   - next render with new activeFile.path (file switch)
  //   - component unmount
  // This is the correct React pattern and eliminates the warning.
  useEffect(() => {
    if (!editorReady || !activeFile) return;

    const cleanup = setupYjs(activeFile);

    // Return cleanup so React calls it automatically
    return () => {
      clearTimeout(autoSaveTimer.current);
      if (typeof cleanup === "function") cleanup();
      // Reset refs so contentRef getter doesn't access destroyed objects
      ytextRef.current    = null;
      ydocRef.current     = null;
      bindingRef.current  = null;
      activePathRef.current = null;
    };
  }, [activeFile?.path, editorReady, setupYjs]);

  const tabsWithState = tabs.map((t) => ({
    ...t, unsaved: unsavedFiles.has(t.path),
  }));

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-hidden">

      {/* label bar */}
      <div className="flex items-center justify-between px-3 h-6 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="font-mono text-[9px] text-cyan-400 tracking-widest">MAIN EDITOR</span>
          <span className="font-mono text-[9px] text-gray-600">— shared · visible to all</span>
        </div>
        {activeFile && (
          <div className="flex items-center gap-3">
            {unsavedFiles.has(activeFile.path) && (
              <span className="font-mono text-[9px] text-amber-400">● unsaved</span>
            )}
            <span className="font-mono text-[9px] text-gray-600 capitalize">
              {getMonacoLanguage(activeFile.name)} · UTF-8
            </span>
            {!autoSave && (
              <button
                onClick={() => {
                  const path = activePathRef.current;
                  if (path && socket && roomId) {
                    socket.emit("editor:save", { roomId, filePath: path });
                    setUnsavedFiles((prev) => { const n = new Set(prev); n.delete(path); return n; });
                  }
                }}
                className="text-gray-500 hover:text-cyan-400 transition-colors"
                title="Save (Ctrl+S)"
              >
                <Save size={10} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* tab bar */}
      <TabBar
        tabs={tabsWithState}
        activeFile={activeFile}
        onSwitchTab={onSwitchTab}
        onCloseTab={onCloseTab}
      />

      {/* Monaco Editor — no key prop, stays mounted permanently */}
      <div className="flex-1 overflow-hidden">
        {activeFile ? (
          <MonacoEditor
            height="100%"
            defaultLanguage="javascript"
            defaultValue=""
            theme="copcode-dark"
            options={EDITOR_OPTIONS}
            beforeMount={handleWillMount}
            onMount={handleDidMount}
            loading={
              <div className="h-full flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-xs text-cyan-400">Loading editor...</span>
                </div>
              </div>
            }
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center select-none bg-[#0d1117]">
      <div className="w-14 h-14 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center justify-center mb-4">
        <span className="font-mono text-xl text-gray-700">&lt;/&gt;</span>
      </div>
      <p className="font-mono text-xs text-gray-600 mb-1">No file open</p>
      <p className="font-mono text-[10px] text-gray-700">Select a file from the sidebar</p>
      <div className="mt-4 text-[10px] font-mono text-gray-700 space-y-1">
        <p>Ctrl+S — Save</p>
        <p>Ctrl+Enter — Run in terminal</p>
      </div>
    </div>
  );
}
