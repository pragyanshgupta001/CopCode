import { useState, useRef, useEffect, forwardRef } from "react";
import {
  ChevronRight, ChevronDown, Folder, FolderOpen,
  FilePlus, FolderPlus, Pencil, Trash2,
} from "lucide-react";
import FileNode from "./FileNode";
import { buildTree } from "./FileTree";

export default function FolderNode({
  node, allNodes, activeFile, onOpenFile,
  onDelete, onRename, onNewFile, onNewFolder,
  onOpenInWorkspace,  // passed through to FileNode
  onMoveFile,         // NEW: called when file dropped into this folder
  depth,
}) {
  const [open, setOpen]           = useState(true);
  const [showMenu, setShowMenu]   = useState(false);
  const [menuPos, setMenuPos]     = useState({ x: 0, y: 0 });
  const [renaming, setRenaming]   = useState(false);
  const [renameVal, setRenameVal] = useState(node.name);
  const [isDragOver, setIsDragOver] = useState(false);

  // local state for creating a file/folder inside THIS folder
  // no longer depends on Sidebar's newItemParent prop
  const [localNewType, setLocalNewType] = useState(null);  // "file" | "folder" | null
  const [localNewName, setLocalNewName] = useState("");

  const menuRef = useRef(null);
  const paddingLeft = 8 + depth * 12;

  const children = buildTree(allNodes, node.path);

  // close context menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(true);
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleRenameSubmit = () => {
    const trimmed = renameVal.trim();
    if (trimmed && trimmed !== node.name) onRename(node, trimmed);
    setRenaming(false);
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === "Enter")  handleRenameSubmit();
    if (e.key === "Escape") { setRenaming(false); setRenameVal(node.name); }
  };

  // local new item handler — creates item inside THIS folder
  const handleLocalNewItem = (type) => {
    setOpen(true);         // expand folder so input is visible
    setLocalNewType(type);
    setLocalNewName("");
  };

  const handleLocalNewItemKeyDown = (e) => {
    if (e.key === "Enter" && localNewName.trim()) {
      // call the parent's create handler with THIS folder's path as parent
      if (localNewType === "file") {
        onNewFile(node.path, localNewName.trim());
      } else {
        onNewFolder(node.path, localNewName.trim());
      }
      setLocalNewType(null);
      setLocalNewName("");
    }
    if (e.key === "Escape") {
      setLocalNewType(null);
      setLocalNewName("");
    }
  };

  // drag source
  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData("application/copcode-node", JSON.stringify({
      path:       node.path,
      name:       node.name,
      type:       "folder",
      parentPath: node.parentPath,
    }));
    e.dataTransfer.effectAllowed = "move";
  };

  //drop zone
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const raw = e.dataTransfer.getData("application/copcode-node");
    if (!raw) return;

    const dragged = JSON.parse(raw);

    // don't drop a folder into itself or a descendant
    if (dragged.path === node.path || node.path.startsWith(dragged.path + "/")) return;

    // don't drop if already in this folder
    if (dragged.parentPath === node.path) return;

    // call move handler
    onMoveFile?.(dragged.path, node.path, dragged.name);
  };

  const sharedChildProps = {
    allNodes,
    activeFile,
    onOpenFile,
    onDelete,
    onRename,
    onOpenInWorkspace,
    onMoveFile,
    onNewFile,
    onNewFolder,
  };

  return (
    <>
      {/* folder row */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex items-center gap-1 py-[3px] cursor-pointer hover:bg-[#21262d] group select-none transition-colors
          ${isDragOver ? "bg-cyan-500/10 outline outline-1 outline-dashed outline-cyan-500/40" : ""}
        `}
        style={{ paddingLeft }}
        onClick={() => !renaming && setOpen(!open)}
        onContextMenu={handleContextMenu}
      >
        <span className="text-gray-600 flex-shrink-0">
          {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </span>
        <span className="text-amber-400 flex-shrink-0">
          {open ? <FolderOpen size={13} /> : <Folder size={13} />}
        </span>

        {/* folder name — or rename input */}
        {renaming ? (
          <input
            autoFocus
            type="text"
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameSubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-[#0d1117] border border-cyan-500/50 rounded px-1 py-0 font-mono text-[11px] text-white outline-none min-w-0"
          />
        ) : (
          <span className="font-mono text-[11px] text-gray-300 group-hover:text-white truncate flex-1 min-w-0">
            {node.name}
          </span>
        )}

        {/* hover action buttons */}
        {!renaming && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto pr-1 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); handleLocalNewItem("file"); }}
              className="w-4 h-4 flex items-center justify-center rounded hover:text-cyan-400 transition-colors"
              title="New file in folder"
            >
              <FilePlus size={9} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleLocalNewItem("folder"); }}
              className="w-4 h-4 flex items-center justify-center rounded hover:text-cyan-400 transition-colors"
              title="New subfolder"
            >
              <FolderPlus size={9} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setRenaming(true); setRenameVal(node.name); }}
              className="w-4 h-4 flex items-center justify-center rounded hover:text-cyan-400 transition-colors"
              title="Rename"
            >
              <Pencil size={9} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(node); }}
              className="w-4 h-4 flex items-center justify-center rounded hover:text-red-400 transition-colors"
              title="Delete folder"
            >
              <Trash2 size={9} />
            </button>
          </div>
        )}
      </div>

      {/* children + inline new item input */}
      {open && (
        <>
          {localNewType && (
            <div style={{ paddingLeft: paddingLeft + 22 }} className="py-0.5 pr-2">
              <input
                autoFocus
                type="text"
                value={localNewName}
                onChange={(e) => setLocalNewName(e.target.value)}
                onKeyDown={handleLocalNewItemKeyDown}
                onBlur={() => { setLocalNewType(null); setLocalNewName(""); }}
                placeholder={localNewType === "file" ? "filename.js" : "folder-name"}
                className="w-full bg-[#0d1117] border border-cyan-500/50 rounded px-1.5 py-0.5 font-mono text-[10px] text-white outline-none"
              />
            </div>
          )}

          {/* render children */}
          {children.map((child) =>
            child.type === "folder" ? (
              <FolderNode
                key={child._id || child.path}
                node={child}
                depth={depth + 1}
                {...sharedChildProps}
              />
            ) : (
              <FileNode
                key={child._id || child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                onOpenFile={onOpenFile}
                onDelete={onDelete}
                onRename={onRename}
                onOpenInWorkspace={onOpenInWorkspace}
                onFileDrop={onMoveFile}
              />
            )
          )}
        </>
      )}

      {/* context menu */}
      {showMenu && (
        <FolderContextMenu
          ref={menuRef}
          x={menuPos.x}
          y={menuPos.y}
          onNewFile={() => { handleLocalNewItem("file"); setShowMenu(false); }}
          onNewFolder={() => { handleLocalNewItem("folder"); setShowMenu(false); }}
          onRename={() => { setRenaming(true); setRenameVal(node.name); setShowMenu(false); }}
          onDelete={() => { onDelete(node); setShowMenu(false); }}
        />
      )}
    </>
  );
}

const FolderContextMenu = forwardRef(function FolderContextMenu(
  { x, y, onNewFile, onNewFolder, onRename, onDelete }, ref
) {
  return (
    <div
      ref={ref}
      className="fixed z-50 bg-[#1c2333] border border-[#30363d] rounded-lg shadow-2xl shadow-black/50 py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      <button onClick={onNewFile}   className="w-full flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] text-gray-300 hover:bg-[#21262d] hover:text-white transition-colors text-left"><FilePlus size={11} className="text-gray-500" />New File</button>
      <button onClick={onNewFolder} className="w-full flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] text-gray-300 hover:bg-[#21262d] hover:text-white transition-colors text-left"><FolderPlus size={11} className="text-gray-500" />New Folder</button>
      <div className="my-0.5 border-t border-[#30363d]" />
      <button onClick={onRename}    className="w-full flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] text-gray-300 hover:bg-[#21262d] hover:text-white transition-colors text-left"><Pencil size={11} className="text-gray-500" />Rename</button>
      <div className="my-0.5 border-t border-[#30363d]" />
      <button onClick={onDelete}    className="w-full flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] text-red-400 hover:bg-red-500/10 transition-colors text-left"><Trash2 size={11} />Delete Folder</button>
    </div>
  );
});