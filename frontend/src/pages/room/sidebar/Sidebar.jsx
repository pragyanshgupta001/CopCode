import { useState } from "react";
import { ChevronLeft, ChevronRight, FilePlus, FolderPlus, Upload } from "lucide-react";
import FileTree from "./FileTree";

export default function Sidebar({
  room, open, onToggle,
  onOpenFile, activeFile,
  socket, roomId,
  localFileTree, onFileTreeUpdate,
  onOpenInWorkspace,
}) {
  const [newItemType, setNewItemType] = useState(null);
  const [newItemName, setNewItemName] = useState("");

  const createItem = (type, name, parentPath) => {
    if (!name?.trim()) return;
    const cleanName = name.trim();
    const path = parentPath ? `${parentPath}/${cleanName}` : `/${cleanName}`;

    const alreadyExists = localFileTree?.find((n) => n.path === path);
    if (alreadyExists) return;

    const newNode = {
      _id:        `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      name:       cleanName,
      path,
      parentPath: parentPath || null,
      language:   getLanguage(cleanName),
      size:       0,
      isExpanded: type === "folder",
    };

    onFileTreeUpdate((prev) => {
      if (prev.find((n) => n.path === path)) return prev;
      return [...prev, newNode];
    });

    if (socket && roomId) {
      socket.emit("file:create", {
        roomId, type,
        name:       cleanName,
        path,
        parentPath: parentPath || null,
        language:   getLanguage(cleanName),
      });
    }
  };

  const handleRootNewItemSubmit = (e) => {
    if (e.key === "Enter" && newItemName.trim()) {
      createItem(newItemType, newItemName.trim(), null);
      setNewItemType(null);
      setNewItemName("");
    }
    if (e.key === "Escape") {
      setNewItemType(null);
      setNewItemName("");
    }
  };

  const handleNewFile = (parentPath, name) => {
    if (name) createItem("file", name, parentPath);
  };

  const handleNewFolder = (parentPath, name) => {
    if (name) createItem("folder", name, parentPath);
  };

  const handleDeleteNode = (node) => {
    onFileTreeUpdate((prev) =>
      prev.filter((n) => n.path !== node.path && !n.path.startsWith(node.path + "/"))
    );
    if (socket && roomId) {
      socket.emit("file:delete", { roomId, path: node.path, type: node.type });
    }
  };

  const handleRenameNode = (node, newName) => {
    const newPath = node.parentPath ? `${node.parentPath}/${newName}` : `/${newName}`;
    onFileTreeUpdate((prev) =>
      prev.map((n) => {
        if (n.path === node.path) return { ...n, name: newName, path: newPath };
        if (node.type === "folder" && n.path.startsWith(node.path + "/")) {
          return {
            ...n,
            path:       n.path.replace(node.path, newPath),
            parentPath: n.parentPath?.replace(node.path, newPath) || n.parentPath,
          };
        }
        return n;
      })
    );
    if (socket && roomId) {
      socket.emit("file:rename", { roomId, oldPath: node.path, newPath, newName });
    }
  };

  const handleMoveFile = (oldPath, newParentPath, name) => {
    const newPath = newParentPath ? `${newParentPath}/${name}` : `/${name}`;
    onFileTreeUpdate((prev) =>
      prev.map((n) => {
        if (n.path === oldPath) return { ...n, path: newPath, parentPath: newParentPath || null };
        if (n.path.startsWith(oldPath + "/")) {
          return {
            ...n,
            path:       n.path.replace(oldPath, newPath),
            parentPath: n.parentPath?.replace(oldPath, newPath) || n.parentPath,
          };
        }
        return n;
      })
    );
    if (socket && roomId) {
      socket.emit("file:move", { roomId, oldPath, newParentPath, name });
    }
  };

  // upload entire folder from PC
  const handleUploadFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const nodes = [];
      await readDir(dirHandle, null, nodes);

      const BLOCKED = ["node_modules", ".git", "dist", "build", ".next", ".vscode"];
      const filtered = nodes.filter(
        (n) => !BLOCKED.some((b) => n.path.includes(`/${b}`))
      );

      const existingPaths = new Set((localFileTree || []).map((n) => n.path));
      const newNodes = filtered.filter((n) => !existingPaths.has(n.path));

      if (newNodes.length > 0) {
        onFileTreeUpdate((prev) => [...prev, ...newNodes]);
      }

      if (socket && roomId) {
        for (const node of newNodes) {
          socket.emit("file:create", {
            roomId,
            type:       node.type,
            name:       node.name,
            path:       node.path,
            parentPath: node.parentPath,
            language:   node.language,
            content:    node.content,
          });
          await new Promise((r) => setTimeout(r, 15));
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Upload error:", err.message);
    }
  };

  const handleRootDrop = (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/copcode-node");
    if (!raw) return;
    const dragged = JSON.parse(raw);
    if (dragged.parentPath === null) return;
    handleMoveFile(dragged.path, null, dragged.name);
  };

  return (
    <div
      className="flex flex-col bg-[#161b22] border-r border-[#30363d] flex-shrink-0 transition-all duration-200"
      style={{ width: open ? "220px" : "36px" }}
    >
      {/* header */}
      <div className="h-8 flex items-center justify-between px-2 border-b border-[#30363d] flex-shrink-0">
        {open && (
          <span className="font-mono text-[9px] text-gray-600 tracking-widest">EXPLORER</span>
        )}
        <div className={`flex items-center gap-0.5 ${!open ? "mx-auto" : ""}`}>
          {open && (
            <>
              <SbBtn icon={<FilePlus size={12} />}   title="New File"      onClick={() => { setNewItemType("file");   setNewItemName(""); }} />
              <SbBtn icon={<FolderPlus size={12} />} title="New Folder"    onClick={() => { setNewItemType("folder"); setNewItemName(""); }} />
              <SbBtn icon={<Upload size={12} />}     title="Upload Folder" onClick={handleUploadFolder} />
            </>
          )}
          <SbBtn
            icon={open ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            title={open ? "Collapse" : "Expand"}
            onClick={onToggle}
          />
        </div>
      </div>

      {/* file tree */}
      {open && (
        <div
          className="flex-1 overflow-y-auto"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleRootDrop}
        >
          {newItemType && (
            <div className="px-2 py-1">
              <input
                autoFocus
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={handleRootNewItemSubmit}
                onBlur={() => setNewItemType(null)}
                placeholder={newItemType === "file" ? "filename.js" : "folder-name"}
                className="w-full bg-[#0d1117] border border-cyan-500/50 rounded px-2 py-0.5 font-mono text-xs text-white outline-none"
              />
            </div>
          )}

          <FileTree
            fileTree={localFileTree || room?.fileTree || []}
            activeFile={activeFile}
            onOpenFile={onOpenFile}
            onDelete={handleDeleteNode}
            onRename={handleRenameNode}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onOpenInWorkspace={onOpenInWorkspace}
            onMoveFile={handleMoveFile}
            roomName={room?.name}
          />
        </div>
      )}
    </div>
  );
}

function SbBtn({ icon, title, onClick }) {
  return (
    <button title={title} onClick={onClick} className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-200 hover:bg-[#21262d] transition-colors">
      {icon}
    </button>
  );
}

function getLanguage(name) {
  const ext = name.split(".").pop().toLowerCase();
  const m = { js:"javascript",jsx:"javascript",ts:"typescript",tsx:"typescript",py:"python",rs:"rust",go:"go",java:"java",cpp:"cpp",c:"c",css:"css",html:"html",json:"json",md:"markdown" };
  return m[ext] || "plaintext";
}

async function readDir(handle, parentPath, nodes) {
  for await (const [name, entry] of handle.entries()) {
    const path = parentPath ? `${parentPath}/${name}` : `/${name}`;
    if (entry.kind === "directory") {
      nodes.push({ _id: `local-${Date.now()}-${Math.random()}`, type: "folder", name, path, parentPath: parentPath || null, isExpanded: false, language: null, size: 0 });
      await readDir(entry, path, nodes);
    } else {
      try {
        const file    = await entry.getFile();
        const content = await file.text();
        nodes.push({ _id: `local-${Date.now()}-${Math.random()}`, type: "file", name, path, parentPath: parentPath || null, language: getLanguage(name), size: file.size, content });
      } catch {
        // skip unreadable files
      }
    }
  }
}