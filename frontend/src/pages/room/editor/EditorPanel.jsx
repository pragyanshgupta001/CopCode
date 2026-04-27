import { useState, useRef, useCallback } from "react";
import MainEditor from "./MainEditor";
import WorkspaceEditor from "./WorkspaceEditor";
import ErrorBoundary from "../../../components/ErrorBoundary";

const MODE = { BOTH: "both", MAIN_ONLY: "main", WS_ONLY: "workspace" };

function ViewToggle({ mode, onMode }) {
  return (
    <div className="h-7 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-end px-3 gap-1.5 flex-shrink-0">
      <span className="font-mono text-[9px] text-gray-700 mr-1.5 tracking-widest">VIEW</span>
      {[
        { label: "Both", value: MODE.BOTH, color: "text-gray-400"   },
        { label: "Main Only", value: MODE.MAIN_ONLY, color: "text-cyan-400"   },
        { label: "Workspace", value: MODE.WS_ONLY, color: "text-purple-400" },
      ].map(({ label, value, color }) => (
        <button
          key={value}
          onClick={() => onMode(value)}
          className={`font-mono text-[10px] px-2.5 py-0.5 rounded border transition-colors ${
            mode === value
              ? `${color} border-current bg-white/5`
              : "text-gray-600 border-transparent hover:text-gray-400 hover:border-[#30363d]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Divider({ onDrag }) {
  return (
    <div
      onMouseDown={onDrag}
      className="relative h-1 flex-shrink-0 cursor-row-resize bg-cyan-500/30 hover:bg-cyan-500/60 transition-colors group"
    >
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="w-1 h-1 rounded-full bg-cyan-400" />
        <span className="w-1 h-1 rounded-full bg-cyan-400" />
        <span className="w-1 h-1 rounded-full bg-cyan-400" />
      </div>
    </div>
  );
}

export default function EditorPanel({
  autoSave, socket, roomId,
  activeMainFile, mainTabs, onCloseMainTab, onSwitchMainTab,
  activeWorkspaceFile, workspaceTabs, workspaceFiles,
  onCloseWorkspaceTab, onSwitchWorkspaceTab,
  onCreateWorkspaceFile, onDeleteWorkspaceFile, onPushToMain,
  mainContentRef, workspaceContentRef,   
}) {
  const [mode, setMode] = useState(MODE.BOTH);
  const [splitRatio, setSplitRatio] = useState(55);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleDividerDrag = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    const container = containerRef.current;
    if (!container) return;
    const onMove = (ev) => {
      if (!isDragging.current) return;
      const rect  = container.getBoundingClientRect();
      setSplitRatio(Math.round(Math.min(80, Math.max(20, ((ev.clientY - rect.top) / rect.height) * 100))));
    };
    const onUp = () => { isDragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-w-0">
      <ViewToggle mode={mode} onMode={setMode} />

      <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">

        {(mode === MODE.BOTH || mode === MODE.MAIN_ONLY) && (
          <div className="flex flex-col overflow-hidden" style={{ height: mode === MODE.BOTH ? `${splitRatio}%` : "100%", minHeight: "80px", flexShrink: 0 }}>
            <ErrorBoundary>
            <MainEditor
              activeFile={activeMainFile}
              tabs={mainTabs}
              onCloseTab={onCloseMainTab}
              onSwitchTab={onSwitchMainTab}
              autoSave={autoSave}
              socket={socket}
              roomId={roomId}
              contentRef={mainContentRef}
            />
            </ErrorBoundary>
          </div>
        )}

        {mode === MODE.BOTH && <Divider onDrag={handleDividerDrag} />}

        {(mode === MODE.BOTH || mode === MODE.WS_ONLY) && (
          <div className="flex flex-col overflow-hidden" style={{ height: mode === MODE.BOTH ? `${100 - splitRatio}%` : "100%", minHeight: "80px", flexShrink: 0 }}>
            <ErrorBoundary>
            <WorkspaceEditor
              activeFile={activeWorkspaceFile}
              tabs={workspaceTabs}
              workspaceFiles={workspaceFiles}
              onCloseTab={onCloseWorkspaceTab}
              onSwitchTab={onSwitchWorkspaceTab}
              onCreateFile={onCreateWorkspaceFile}
              onDeleteFile={onDeleteWorkspaceFile}
              onPushToMain={onPushToMain}
              socket={socket}
              roomId={roomId}
              contentRef={workspaceContentRef}
            />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
}
