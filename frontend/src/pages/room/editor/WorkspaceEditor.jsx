import { useState, useCallback, useRef, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { X, FilePlus, Upload, Trash2 } from "lucide-react";

import { javascript } from "@codemirror/lang-javascript";
import { python }     from "@codemirror/lang-python";
import { css }        from "@codemirror/lang-css";
import { html }       from "@codemirror/lang-html";
import { json }       from "@codemirror/lang-json";
import { markdown }   from "@codemirror/lang-markdown";
import { cpp }        from "@codemirror/lang-cpp";
import { java }       from "@codemirror/lang-java";
import { rust }       from "@codemirror/lang-rust";
import { sql }        from "@codemirror/lang-sql";
import { xml }        from "@codemirror/lang-xml";

import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, drawSelection } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, foldGutter, foldKeymap, indentOnInput } from "@codemirror/language";
import { autocompletion, completionKeymap, closeBrackets } from "@codemirror/autocomplete";
import { highlightActiveLine } from "@codemirror/view";
import { highlightSelectionMatches } from "@codemirror/search";
import { indentWithTab } from "@codemirror/commands";

import { getFileIcon, getFileIconColor } from "../utils/fileIcons";

function getLanguageExtension(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js": case "jsx":  return javascript({ jsx: true });
    case "ts": case "tsx":  return javascript({ typescript: true, jsx: true });
    case "py":   return python();
    case "css": case "scss": return css();
    case "html": return html();
    case "json": return json();
    case "md":   return markdown();
    case "cpp": case "c": case "h": return cpp();
    case "java": return java();
    case "rs":   return rust();
    case "sql":  return sql();
    case "xml":  return xml();
    default:     return javascript();
  }
}

const workspaceTheme = EditorView.theme({
  ".cm-editor": {
    backgroundColor: "#0f0c1a",
    color: "#e6edf3",
    height: "100%",
  },

  "&": {
    backgroundColor: "#0f0c1a",
    color: "#e6edf3",
    height: "100%",
    fontFamily: "'JetBrains Mono', Consolas, monospace",
    fontSize: "12px",
  },

  ".cm-content": {
    backgroundColor: "#0f0c1a",
    color: "#e6edf3",
    caretColor: "#a78bfa",
  },

  ".cm-line": {
    color: "#e6edf3",
  },

  ".cm-cursor": {
    borderLeftColor: "#a78bfa",
    borderLeftWidth: "2px",
  },

  ".cm-activeLine": {
    backgroundColor: "#1a1130",
  },

  ".cm-activeLineGutter": {
    backgroundColor: "#1a1130",
  },

  ".cm-gutters": {
    backgroundColor: "#13102b",
    borderRight: "1px solid #2d2040",
    color: "#4a3a6a",
  },

  ".cm-selectionBackground, ::selection": {
    backgroundColor: "#3b2070 !important",
  },

  ".cm-scroller": {
    backgroundColor: "#0f0c1a",
  }

}, { dark: true });

const BASE_EXTENSIONS = [
  lineNumbers(), highlightActiveLineGutter(), highlightActiveLine(),
  highlightSelectionMatches(), history(), foldGutter(), drawSelection(),
  indentOnInput(), bracketMatching(), closeBrackets(), autocompletion(),
  keymap.of([...defaultKeymap, ...historyKeymap, ...completionKeymap, ...foldKeymap, indentWithTab]),
  EditorState.tabSize.of(2), EditorView.lineWrapping, workspaceTheme,
];

export default function WorkspaceEditor({
  activeFile, tabs, workspaceFiles,
  onCloseTab, onSwitchTab, onCreateFile, onDeleteFile, onPushToMain,
  socket, roomId,
  contentRef, // ref to expose getContent() for TerminalPanel
}) {
  const [contentCache, setContentCache]   = useState({});
  const [unsavedFiles, setUnsavedFiles]   = useState(new Set());
  const [showNewFile, setShowNewFile]     = useState(false);
  const [newFileName, setNewFileName]     = useState("");
  const autoSaveTimer                     = useRef(null);

  // expose content getter via ref for TerminalPanel
  useEffect(() => {
    if (contentRef) {
      contentRef.current = () => {
        if (!activeFile) return "";
        return contentCache[activeFile.id] ?? activeFile.content ?? "";
      };
    }
  }, [contentRef, activeFile, contentCache]);

  // Listen for room file content loaded via "Open in Workspace"
  useEffect(() => {
    if (!socket) return;

    socket.on("workspace:room-file-content", ({ fileId, content }) => {
      setContentCache((prev) => ({ ...prev, [fileId]: content }));
    });

    return () => {
      socket.off("workspace:room-file-content");
    };
  }, [socket]);
  const handleChange = useCallback((value) => {
    if (!activeFile) return;
    setContentCache((prev) => ({ ...prev, [activeFile.id]: value }));
    setUnsavedFiles((prev) => new Set(prev).add(activeFile.id));

    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (socket && roomId) {
        socket.emit("workspace:update", {
          roomId,
          fileId: activeFile.id,
          sourcePath: activeFile.sourcePath || null,
          content: value,
        });
      }
      setUnsavedFiles((prev) => {
        const next = new Set(prev);
        next.delete(activeFile.id);
        return next;
      });
    }, 500);
  }, [activeFile, socket, roomId]);

  const handlePush = () => {
    if (!activeFile) return;
    const latestContent = contentCache[activeFile.id] ?? activeFile.content ?? "";
    onPushToMain({ ...activeFile, content: latestContent });
  };

  const handleNewFileKeyDown = (e) => {
    if (e.key === "Enter" && newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName("");
      setShowNewFile(false);
    }
    if (e.key === "Escape") {
      setShowNewFile(false);
      setNewFileName("");
    }
  };

  const handleDeleteFile = (file, e) => {
    e.stopPropagation();
    onCloseTab(file);
    if (onDeleteFile) onDeleteFile(file.id);
    if (socket && roomId) {
      socket.emit("workspace:delete-file", { roomId, fileId: file.id });
    }
  };

  const getCurrentContent = () => {
    if (!activeFile) return "";
    return contentCache[activeFile.id] ?? activeFile.content ?? "";
  };

  const tabsWithState = tabs.map((t) => ({ ...t, unsaved: unsavedFiles.has(t.id) }));

  return (
    <div className="flex flex-col h-full bg-[#0f0c1a] overflow-hidden">

      {/* label bar */}
      <div className="flex items-center justify-between px-3 h-6 bg-[#1a1130] border-b border-[#2d2040] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span className="font-mono text-[9px] text-purple-400 tracking-widest">PERSONAL WORKSPACE</span>
          <span className="font-mono text-[9px] text-gray-600">— private · only you</span>
        </div>
        <div className="flex items-center gap-2">
          {activeFile && unsavedFiles.has(activeFile.id) && (
            <span className="font-mono text-[9px] text-amber-400">● unsaved</span>
          )}
          {activeFile && (
            <button
              onClick={handlePush}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-purple-500/30 bg-purple-500/5 text-purple-400 hover:bg-purple-500/15 transition-colors font-mono text-[10px]"
            >
              <Upload size={9} />
              Push to Main
            </button>
          )}
        </div>
      </div>

      {/* tab bar */}
      {tabs.length > 0 && (
        <div className="flex items-end bg-[#1a1130] border-b border-[#2d2040] overflow-x-auto flex-shrink-0 h-8">
          {tabsWithState.map((tab) => {
            const isActive = activeFile?.id === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => onSwitchTab(tab)}
                className={`flex items-center gap-1.5 px-3 h-full min-w-0 max-w-[140px] border-r border-[#2d2040] cursor-pointer flex-shrink-0 group transition-colors select-none ${
                  isActive ? "bg-[#0f0c1a] text-white" : "bg-[#1a1130] text-gray-500 hover:bg-[#201540]"
                }`}
                style={{ borderTop: isActive ? "1px solid #a78bfa" : "1px solid transparent" }}
              >
                {tab.unsaved
                  ? <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  : <span className="font-mono text-[9px] font-bold flex-shrink-0" style={{ color: getFileIconColor(tab.name) }}>{getFileIcon(tab.name)}</span>
                }
                <span className="font-mono text-[11px] truncate">{tab.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onCloseTab(tab); }}
                  className="flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* body */}
      <div className="flex flex-1 overflow-hidden">
        {/* workspace file list */}
        <div className="w-40 bg-[#13102b] border-r border-[#2d2040] flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between px-2 h-7 border-b border-[#2d2040]">
            <span className="font-mono text-[9px] text-gray-600 tracking-widest">FILES</span>
            <button onClick={() => setShowNewFile(true)} className="text-gray-600 hover:text-purple-400 transition-colors"><FilePlus size={11} /></button>
          </div>
          {showNewFile && (
            <div className="px-2 py-1">
              <input autoFocus type="text" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} onKeyDown={handleNewFileKeyDown} onBlur={() => { setShowNewFile(false); setNewFileName(""); }} placeholder="name.js" className="w-full bg-[#0d1117] border border-purple-500/40 rounded px-1.5 py-0.5 font-mono text-[10px] text-white outline-none" />
            </div>
          )}
          <div className="flex-1 overflow-y-auto py-0.5">
            {workspaceFiles.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="font-mono text-[10px] text-gray-700">No files</p>
              </div>
            ) : (
              workspaceFiles.map((file) => {
                const isActive = activeFile?.id === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => onSwitchTab(file)}
                    className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer transition-colors group ${
                      isActive ? "bg-purple-500/10 text-white" : "text-gray-500 hover:bg-[#1a1130] hover:text-gray-300"
                    }`}
                  >
                    <span className="font-mono text-[9px] font-bold flex-shrink-0" style={{ color: getFileIconColor(file.name) }}>{getFileIcon(file.name)}</span>
                    <span className="font-mono text-[10px] truncate flex-1 min-w-0">{file.name}</span>
                    <button onClick={(e) => handleDeleteFile(file, e)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"><Trash2 size={9} /></button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CodeMirror */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeFile ? (
            <CodeMirror
              value={getCurrentContent()}
              height="100%"
              extensions={[...BASE_EXTENSIONS, getLanguageExtension(activeFile.name)]}
              onChange={handleChange}
              basicSetup={false}
              style={{ height: "100%", overflow: "hidden" }}
            />
          ) : (
            <WorkspaceEmptyState onShowNewFile={() => setShowNewFile(true)} />
          )}
        </div>
      </div>
    </div>
  );
}

function WorkspaceEmptyState({ onShowNewFile }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center select-none">
      <div className="w-14 h-14 rounded-2xl bg-[#1a1130] border border-[#2d2040] flex items-center justify-center mb-4">
        <span className="font-mono text-xl text-gray-700">{ }</span>
      </div>
      <p className="font-mono text-xs text-gray-600 mb-1">No file open</p>
      <p className="font-mono text-[10px] text-gray-700 mb-3">Create a file in your workspace</p>
      <button onClick={onShowNewFile} className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-purple-500/30 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 transition-colors font-mono text-[10px]">
        <FilePlus size={11} /> New file
      </button>
    </div>
  );
}

