import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useRoomStore from "../../store/useRoomStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useSocketStore } from "../../store/useSocketStore";
import RoomNavbar from "./RoomNavbar";
import RoomLayout from "./RoomLayout";

function getLanguageFromName(name = "") {
  const ext = name.split(".").pop().toLowerCase();
  const m = { js:"javascript",jsx:"javascript",ts:"typescript",tsx:"typescript",py:"python",rs:"rust",go:"go",java:"java",cpp:"cpp",c:"c",rb:"ruby",kt:"kotlin",swift:"swift",css:"css",scss:"css",html:"html",json:"json",md:"markdown",xml:"xml",sql:"sql",sh:"shell",txt:"plaintext" };
  return m[ext] || "plaintext";
}

export default function RoomPage() {
  const { state } = useLocation();
  const { slug } = useParams();
  const navigate = useNavigate();

  const { getRoom, getMyRooms, currentRoom, myRooms, isFetchingRoom, clearCurrentRoom } = useRoomStore();
  const { authUser } = useAuthStore();
  const { socket, connectSocket, setCurrentRoomId, clearCurrentRoomId } = useSocketStore();

  const [autoSave, setAutoSave] = useState(true);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [localFileTree, setLocalFileTree] = useState([]);
  const [activeMainFile, setActiveMainFile] = useState(null);
  const [mainTabs, setMainTabs] = useState([]);
  const [activeWorkspaceFile, setActiveWorkspaceFile] = useState(null);
  const [workspaceTabs, setWorkspaceTabs] = useState([]);
  const [workspaceFiles, setWorkspaceFiles] = useState([]);

  const mainContentRef = useRef(null);
  const workspaceContentRef = useRef(null);

  const roomIdFromState = state?.roomId;
  const roomIdFromCurrent = currentRoom?.roomId;

  const roomIdFromSlug = myRooms?.find((r) => {
    const roomSlug = r.name.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return roomSlug === slug;
  })?.roomId;

  const roomId = roomIdFromState || roomIdFromCurrent || roomIdFromSlug;

  useEffect(() => {
    if (roomId) {
      getRoom(roomId);
    } else {
      getMyRooms();
    }
  }, [roomId]);

  useEffect(() => {
    if (roomIdFromSlug && !currentRoom) {
      getRoom(roomIdFromSlug);
    }
  }, [roomIdFromSlug]);

  useEffect(() => {
    if (!isFetchingRoom && !currentRoom && !roomId && myRooms !== null) {
      navigate("/join-room");
    }
  }, [isFetchingRoom, currentRoom, roomId, myRooms]);

  useEffect(() => {
    if (currentRoom?.fileTree) setLocalFileTree(currentRoom.fileTree);
  }, [currentRoom?.fileTree]);

  useEffect(() => {
    if (!roomId || !authUser) return;
    connectSocket();
  }, [roomId, authUser]);

  useEffect(() => {
    if (!socket || !roomId) return;
    setCurrentRoomId(roomId);

    socket.emit("join-room",      roomId);
    socket.emit("workspace:load", roomId);
    socket.emit("chat:history",   roomId);

    socket.on("online-members", (members) => setOnlineMembers(members));

    socket.on("file:created", ({ node }) => {
      setLocalFileTree((prev) => {
        const exists = prev.find((n) => n.path === node.path);
        if (exists) return prev.map((n) => n.path === node.path ? node : n);
        return [...prev, node];
      });
    });

    socket.on("file:deleted", ({ paths }) => {
      setLocalFileTree((prev) => prev.filter((n) => !paths.includes(n.path)));
      setMainTabs((prev) => prev.filter((t) => !paths.includes(t.path)));
      setActiveMainFile((prev) => prev && paths.includes(prev.path) ? null : prev);
    });

    socket.on("file:renamed", ({ oldPath, newPath, newName }) => {
      setLocalFileTree((prev) => prev.map((n) => {
        if (n.path === oldPath) return { ...n, name: newName, path: newPath };
        if (n.path.startsWith(oldPath + "/")) return { ...n, path: n.path.replace(oldPath, newPath), parentPath: n.parentPath?.replace(oldPath, newPath) || n.parentPath };
        return n;
      }));
    });

    socket.on("file:moved", ({ oldPath, newPath, newParentPath }) => {
      setLocalFileTree((prev) => prev.map((n) => {
        if (n.path === oldPath) return { ...n, path: newPath, parentPath: newParentPath || null };
        if (n.path.startsWith(oldPath + "/")) return { ...n, path: n.path.replace(oldPath, newPath), parentPath: n.parentPath?.replace(oldPath, newPath) || n.parentPath };
        return n;
      }));
    });

    socket.on("workspace:loaded", (files) => {
      setWorkspaceFiles(files.map((f) => ({ id: f.fileId, name: f.name, language: f.language, content: f.content })));
    });

    socket.on("workspace:file-created", (file) => {
      const nf = { id: file.fileId, name: file.name, language: file.language, content: file.content || "" };
      setWorkspaceFiles((prev) => prev.find((f) => f.id === nf.id) ? prev : [...prev, nf]);
      setActiveWorkspaceFile(nf);
      setWorkspaceTabs((prev) => prev.find((t) => t.id === nf.id) ? prev : [...prev, nf]);
    });

    socket.on("workspace:file-deleted", ({ fileId }) => {
      setWorkspaceFiles((prev) => prev.filter((f) => f.id !== fileId));
      setWorkspaceTabs((prev) => prev.filter((t) => t.id !== fileId));
      setActiveWorkspaceFile((prev) => prev?.id === fileId ? null : prev);
    });

    socket.on("workspace:room-file-content", ({ fileId, filePath, content }) => {
      setWorkspaceFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, sourcePath: f.sourcePath || filePath, content } : f));
      setActiveWorkspaceFile((prev) => prev?.id === fileId ? { ...prev, sourcePath: prev.sourcePath || filePath, content } : prev);
      setWorkspaceTabs((prev) => prev.map((t) => t.id === fileId ? { ...t, sourcePath: t.sourcePath || filePath, content } : t));
    });

    socket.on("editor:file-pushed", ({ filePath, fileName, content }) => {
      const roomFile = { name: fileName, path: filePath, language: getLanguageFromName(fileName), content };
      setActiveMainFile(roomFile);
      setMainTabs((prev) => {
        const exists = prev.find((t) => t.path === filePath);
        return exists ? prev.map((t) => t.path === filePath ? roomFile : t) : [...prev, roomFile];
      });
      setLocalFileTree((prev) => {
        if (prev.find((n) => n.path === filePath)) return prev;
        return [...prev, { _id: `pushed-${Date.now()}`, type: "file", name: fileName, path: filePath, parentPath: null, language: getLanguageFromName(fileName), size: 0 }];
      });
    });

    return () => {
      socket.emit("leave-room", roomId);
      clearCurrentRoomId();
      ["online-members","file:created","file:deleted","file:renamed","file:moved",
       "workspace:loaded","workspace:file-created","workspace:file-deleted",
       "workspace:room-file-content","editor:file-pushed"].forEach((e) => socket.off(e));
    };
  }, [socket, roomId]);

  useEffect(() => () => clearCurrentRoom(), []);

  const isOwner = currentRoom?.owner?._id?.toString() === authUser?._id?.toString();

  const handleOpenMainFile = useCallback((file) => {
    setActiveMainFile(file);
    setMainTabs((prev) => prev.find((t) => t.path === file.path) ? prev : [...prev, file]);
    if (socket && roomId) {
      socket.emit("editor:join",        { roomId, filePath: file.path });
      socket.emit("editor:active-file", { roomId, filePath: file.path });
    }
  }, [socket, roomId]);

  const handleCloseMainTab = (file) => {
    const remaining = mainTabs.filter((t) => t.path !== file.path);
    setMainTabs(remaining);
    if (activeMainFile?.path === file.path) setActiveMainFile(remaining[remaining.length - 1] || null);
  };

  const handleOpenWorkspaceFile = useCallback((file) => {
    setActiveWorkspaceFile(file);
    setWorkspaceTabs((prev) => prev.find((t) => t.id === file.id) ? prev : [...prev, file]);
  }, []);

  const handleCloseWorkspaceTab = (file) => {
    const remaining = workspaceTabs.filter((t) => t.id !== file.id);
    setWorkspaceTabs(remaining);
    if (activeWorkspaceFile?.id === file.id) setActiveWorkspaceFile(remaining[remaining.length - 1] || null);
  };

  const handleCreateWorkspaceFile = (name) => {
    const fileId = `ws-${Date.now()}`;
    if (socket && roomId) {
      socket.emit("workspace:create-file", { roomId, fileId, name, language: getLanguageFromName(name) });
    } else {
      const nf = { id: fileId, name, language: getLanguageFromName(name), content: "" };
      setWorkspaceFiles((prev) => [...prev, nf]);
      handleOpenWorkspaceFile(nf);
    }
  };

  const handleDeleteWorkspaceFile = (fileId) => {
    setWorkspaceFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handlePushToMain = (file) => {
    if (!socket || !roomId) return;
    const payload = {
      roomId,
      fileId: file.id,
      fileName: file.name,
      sourcePath: file.sourcePath,
      content: file.content ?? "",
    };

    // Save to workspace DB only for real workspace files, not room-file mirrors.
    if (!file.sourcePath && file.content !== undefined) {
      socket.emit("workspace:update", { roomId, fileId: file.id, content: file.content });
    }
    socket.emit("workspace:push", payload);
  };

  // loading state
  if (isFetchingRoom || (!currentRoom && roomId)) {
    return (
      <div className="h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm text-cyan-400 animate-pulse">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!currentRoom) return null;

  return (
    <div className="h-screen flex flex-col bg-[#0d1117] overflow-hidden">
      <RoomNavbar
        room={currentRoom}
        isOwner={isOwner}
        authUser={authUser}
        autoSave={autoSave}
        onAutoSaveToggle={() => setAutoSave(!autoSave)}
        onlineMembers={onlineMembers}
      />
      <RoomLayout
        room={currentRoom}
        isOwner={isOwner}
        authUser={authUser}
        autoSave={autoSave}
        socket={socket}
        roomId={roomId}
        localFileTree={localFileTree}
        onFileTreeUpdate={setLocalFileTree}
        activeMainFile={activeMainFile}
        mainTabs={mainTabs}
        onOpenMainFile={handleOpenMainFile}
        onCloseMainTab={handleCloseMainTab}
        activeWorkspaceFile={activeWorkspaceFile}
        workspaceTabs={workspaceTabs}
        workspaceFiles={workspaceFiles}
        setWorkspaceFiles={setWorkspaceFiles}
        onOpenWorkspaceFile={handleOpenWorkspaceFile}
        onCloseWorkspaceTab={handleCloseWorkspaceTab}
        onCreateWorkspaceFile={handleCreateWorkspaceFile}
        onDeleteWorkspaceFile={handleDeleteWorkspaceFile}
        onPushToMain={handlePushToMain}
        mainContentRef={mainContentRef}
        workspaceContentRef={workspaceContentRef}
      />
    </div>
  );
}
