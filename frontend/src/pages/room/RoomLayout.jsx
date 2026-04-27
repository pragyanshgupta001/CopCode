import { useState } from "react";
import Sidebar from "./sidebar/Sidebar";
import EditorPanel from "./editor/EditorPanel";
import ChatPanel from "./chat/ChatPanel";
import TerminalPanel from "./terminal/TerminalPanel";

export default function RoomLayout({
  room, isOwner, authUser, autoSave,
  socket, roomId,
  localFileTree, onFileTreeUpdate,
  activeMainFile, mainTabs, onOpenMainFile, onCloseMainTab,
  activeWorkspaceFile, workspaceTabs, workspaceFiles,
  onOpenWorkspaceFile, onCloseWorkspaceTab,
  onCreateWorkspaceFile, onDeleteWorkspaceFile, onPushToMain,
  setWorkspaceFiles,
  mainContentRef,
  workspaceContentRef,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(200);

  const handleTerminalDrag = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = terminalHeight;
    const onMove = (ev) => setTerminalHeight(Math.min(420, Math.max(100, startH + (startY - ev.clientY))));
    const onUp   = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleOpenInWorkspace = (node) => {
    const existing = workspaceFiles?.find((f) => f.sourcePath === node.path);
    if (existing) {
      onOpenWorkspaceFile(existing);
      return;
    }

    const fileId = `ws-room-${node.path.replace(/\//g, "-")}`;
    // create a workspace-local copy of this room file
    const workspaceFile = {
      id:       fileId,
      name:     node.name,
      language: node.language || "plaintext",
      sourcePath: node.path,
      content:  "",
    };
    
    setWorkspaceFiles?.((prev) => {
      if (prev.find((f) => f.sourcePath === node.path)) return prev;
      return [...prev, workspaceFile];
    });
    onOpenWorkspaceFile(workspaceFile);

    // also load the content from FileContent via socket
    if (socket && roomId) {
      socket.emit("workspace:open-room-file", {
        roomId,
        filePath: node.path,
        fileId:   workspaceFile.id,
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR — now receives onOpenInWorkspace */}
        <Sidebar
          room={room}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onOpenFile={onOpenMainFile}
          activeFile={activeMainFile}
          socket={socket}
          roomId={roomId}
          localFileTree={localFileTree}
          onFileTreeUpdate={onFileTreeUpdate}
          onOpenInWorkspace={handleOpenInWorkspace}
        />

        {/* CENTER */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <EditorPanel
            autoSave={autoSave}
            socket={socket}
            roomId={roomId}
            activeMainFile={activeMainFile}
            mainTabs={mainTabs}
            onCloseMainTab={onCloseMainTab}
            onSwitchMainTab={onOpenMainFile}
            activeWorkspaceFile={activeWorkspaceFile}
            workspaceTabs={workspaceTabs}
            workspaceFiles={workspaceFiles}
            onCloseWorkspaceTab={onCloseWorkspaceTab}
            onSwitchWorkspaceTab={onOpenWorkspaceFile}
            onCreateWorkspaceFile={onCreateWorkspaceFile}
            onDeleteWorkspaceFile={onDeleteWorkspaceFile}
            onPushToMain={onPushToMain}
            mainContentRef={mainContentRef}
            workspaceContentRef={workspaceContentRef}
          />

          {terminalOpen && (
            <div
              className="h-1 bg-[#30363d] hover:bg-cyan-500/40 cursor-row-resize flex-shrink-0 transition-colors"
              onMouseDown={handleTerminalDrag}
            />
          )}

          <TerminalPanel
            open={terminalOpen}
            onToggle={() => setTerminalOpen(!terminalOpen)}
            height={terminalHeight}
            activeMainFile={activeMainFile}
            activeWorkspaceFile={activeWorkspaceFile}
            getMainContent={() => mainContentRef?.current?.()}
            getWorkspaceContent={() => workspaceContentRef?.current?.()}
          />
        </div>

        {/* CHAT */}
        <ChatPanel
          open={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
          room={room}
          authUser={authUser}
          socket={socket}
          roomId={roomId}
        />
      </div>
    </div>
  );
}