import { useState, useCallback, useRef, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { X, FilePlus, Upload, Trash2 } from "lucide-react";
import { getFileIcon, getFileIconColor } from "../utils/fileIcons";
import { MONACO_THEME, EDITOR_OPTIONS, getMonacoLanguage } from "./editorShared.js";

export default function WorkspaceEditor({
  activeFile, tabs, workspaceFiles,
  onCloseTab, onSwitchTab, onCreateFile, onDeleteFile, onPushToMain,
  socket, roomId,
  contentRef,
}) {
  const [contentCache, setContentCache] = useState({});
  const [unsavedFiles, setUnsavedFiles] = useState(new Set());
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const autoSaveTimer = useRef(null);

  useEffect(() => {
    if (contentRef) {
      contentRef.current = () => {
        if (!activeFile) return "";
        return contentCache[activeFile.id] ?? activeFile.content ?? "";
      };
    }
  }, [contentRef, activeFile, contentCache]);

  useEffect(() => {
    if (!socket) return;
    socket.on("workspace:room-file-content", ({ fileId, content }) => {
      setContentCache((prev) => ({ ...prev, [fileId]: content }));
    });
    return () => {
      socket.off("workspace:room-file-content");
    };
  }, [socket]);

  const handleChange = useCallback(
    (value) => {
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
    },
    [activeFile, socket, roomId]
  );

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

  const handleWillMount = (monaco) => {
    monaco.editor.defineTheme("copcode-dark", MONACO_THEME);
  };

  const tabsWithState = tabs.map((t) => ({ ...t, unsaved: unsavedFiles.has(t.id) }));

  return (
    <div className="flex flex-col h-full bg-[#0d1117] overflow-hidden">

      <div className="flex items-center justify-between px-3 h-6 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span className="font-mono text-[9px] text-violet-300 tracking-widest">PERSONAL WORKSPACE</span>
          <span className="font-mono text-[9px] text-gray-600">— private · matches main editor</span>
        </div>
        <div className="flex items-center gap-2">
          {activeFile && unsavedFiles.has(activeFile.id) && (
            <span className="font-mono text-[9px] text-amber-400">● unsaved</span>
          )}
          {activeFile && (
            <button
              type="button"
              onClick={handlePush}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/15 transition-colors font-mono text-[10px]"
            >
              <Upload size={9} />
              Push to Main
            </button>
          )}
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="flex items-end bg-[#161b22] border-b border-[#30363d] overflow-x-auto flex-shrink-0 h-9">
          {tabsWithState.map((tab) => {
            const isActive = activeFile?.id === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => onSwitchTab(tab)}
                className={`flex items-center gap-1.5 px-3 h-full min-w-0 max-w-[160px] border-r border-[#30363d] cursor-pointer flex-shrink-0 group transition-colors select-none ${
                  isActive ? "bg-[#0d1117] text-white" : "bg-[#161b22] text-gray-400 hover:bg-[#1c2333]"
                }`}
                style={{ borderTop: isActive ? "1px solid #a78bfa" : "1px solid transparent" }}
              >
                {tab.unsaved ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                ) : (
                  <span className="font-mono text-[9px] font-bold flex-shrink-0" style={{ color: getFileIconColor(tab.name) }}>
                    {getFileIcon(tab.name)}
                  </span>
                )}
                <span className="font-mono text-[11px] truncate">{tab.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab);
                  }}
                  className="flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-40 bg-[#161b22] border-r border-[#30363d] flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between px-2 h-7 border-b border-[#30363d]">
            <span className="font-mono text-[9px] text-gray-600 tracking-widest">FILES</span>
            <button type="button" onClick={() => setShowNewFile(true)} className="text-gray-600 hover:text-cyan-400 transition-colors">
              <FilePlus size={11} />
            </button>
          </div>
          {showNewFile && (
            <div className="px-2 py-1">
              <input
                autoFocus
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={handleNewFileKeyDown}
                onBlur={() => {
                  setShowNewFile(false);
                  setNewFileName("");
                }}
                placeholder="name.js"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded px-1.5 py-0.5 font-mono text-[10px] text-white outline-none focus:border-cyan-500/50"
              />
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
                      isActive ? "bg-cyan-500/10 text-white" : "text-gray-500 hover:bg-[#21262d] hover:text-gray-300"
                    }`}
                  >
                    <span className="font-mono text-[9px] font-bold flex-shrink-0" style={{ color: getFileIconColor(file.name) }}>
                      {getFileIcon(file.name)}
                    </span>
                    <span className="font-mono text-[10px] truncate flex-1 min-w-0">{file.name}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteFile(file, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {activeFile ? (
            <MonacoEditor
              key={activeFile.id}
              path={`workspace-${activeFile.id}`}
              height="100%"
              language={getMonacoLanguage(activeFile.name)}
              theme="copcode-dark"
              value={getCurrentContent()}
              options={EDITOR_OPTIONS}
              beforeMount={handleWillMount}
              onChange={handleChange}
              loading={
                <div className="h-full flex items-center justify-center bg-[#0d1117]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-xs text-cyan-400">Loading editor...</span>
                  </div>
                </div>
              }
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
    <div className="h-full flex flex-col items-center justify-center text-center select-none bg-[#0d1117]">
      <div className="w-14 h-14 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center justify-center mb-4">
        <span className="font-mono text-xl text-gray-700">&lt;/&gt;</span>
      </div>
      <p className="font-mono text-xs text-gray-600 mb-1">No file open</p>
      <p className="font-mono text-[10px] text-gray-700 mb-3">Create a file in your workspace</p>
      <button
        type="button"
        onClick={onShowNewFile}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-colors font-mono text-[10px]"
      >
        <FilePlus size={11} /> New file
      </button>
    </div>
  );
}
