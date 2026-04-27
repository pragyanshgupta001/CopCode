import { useState, useRef, useEffect, forwardRef } from "react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { getFileIcon, getFileIconColor } from "../utils/fileIcons";

export default function FileNode({
  node, activeFile, onOpenFile,
  onDelete, onRename,
  onOpenInWorkspace,  // NEW: opens this file in personal workspace
  onFileDrop,         // NEW: called when a file is dropped onto this node
  depth,
}) {
  const [showMenu, setShowMenu]   = useState(false);
  const [menuPos, setMenuPos]     = useState({ x: 0, y: 0 });
  const [renaming, setRenaming]   = useState(false);
  const [renameVal, setRenameVal] = useState(node.name);
  const [isDragOver, setIsDragOver] = useState(false); // for drop target highlight
  const menuRef                   = useRef(null);

  const isActive    = activeFile?.path === node.path;
  const paddingLeft = 8 + depth * 12 + 14;

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

  // ── drag source (Problem 3 — drag and drop) ───────────
  const handleDragStart = (e) => {
    e.stopPropagation();
    // store the dragged node's path and parentPath as JSON
    e.dataTransfer.setData("application/copcode-node", JSON.stringify({
      path:       node.path,
      name:       node.name,
      type:       node.type,
      parentPath: node.parentPath,
    }));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <>
      <div
        draggable
        onDragStart={handleDragStart}
        className={`
          flex items-center gap-1.5 py-[3px] cursor-pointer group select-none
          transition-colors
          ${isActive
            ? "bg-[#1f2937] text-white"
            : "hover:bg-[#21262d] text-gray-400 hover:text-gray-200"
          }
          ${isDragOver ? "bg-cyan-500/10 border border-dashed border-cyan-500/40" : ""}
        `}
        style={{ paddingLeft }}
        onClick={() => !renaming && onOpenFile(node)}
        onContextMenu={handleContextMenu}
      >
        {/* file icon */}
        <span
          className="font-mono text-[9px] font-bold flex-shrink-0"
          style={{ color: getFileIconColor(node.name) }}
        >
          {getFileIcon(node.name)}
        </span>

        {/* filename — or inline rename input */}
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
          <span className={`font-mono text-[11px] truncate flex-1 min-w-0 ${isActive ? "text-white" : ""}`}>
            {node.name}
          </span>
        )}

        {/* hover action buttons */}
        {!renaming && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto pr-1 flex-shrink-0">
            {/* NEW: open in personal workspace button */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenInWorkspace?.(node); }}
              className="w-4 h-4 flex items-center justify-center rounded hover:text-purple-400 transition-colors"
              title="Open in personal workspace"
            >
              <ExternalLink size={9} />
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
              title="Delete"
            >
              <Trash2 size={9} />
            </button>
          </div>
        )}

        {/* unsaved dot */}
        {node.unsaved && !renaming && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mr-1" />
        )}
      </div>

      {/* right-click context menu */}
      {showMenu && (
        <ContextMenu
          ref={menuRef}
          x={menuPos.x}
          y={menuPos.y}
          onOpenInWorkspace={() => { onOpenInWorkspace?.(node); setShowMenu(false); }}
          onRename={() => { setRenaming(true); setRenameVal(node.name); setShowMenu(false); }}
          onDelete={() => { onDelete(node); setShowMenu(false); }}
        />
      )}
    </>
  );
}

const ContextMenu = forwardRef(function ContextMenu(
  { x, y, onOpenInWorkspace, onRename, onDelete }, ref
) {
  return (
    <div
      ref={ref}
      className="fixed z-50 bg-[#1c2333] border border-[#30363d] rounded-lg shadow-2xl shadow-black/50 py-1 min-w-[160px]"
      style={{ left: x, top: y }}
    >
      {/* NEW: open in workspace option */}
      <button
        onClick={onOpenInWorkspace}
        className="w-full flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] text-purple-300 hover:bg-purple-500/10 transition-colors text-left"
      >
        <ExternalLink size={11} className="text-purple-400" />
        Open in Workspace
      </button>
      <div className="my-0.5 border-t border-[#30363d]" />
      <button
        onClick={onRename}
        className="w-full flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] text-gray-300 hover:bg-[#21262d] hover:text-white transition-colors text-left"
      >
        <Pencil size={11} className="text-gray-500" />
        Rename
      </button>
      <div className="my-0.5 border-t border-[#30363d]" />
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] text-red-400 hover:bg-red-500/10 transition-colors text-left"
      >
        <Trash2 size={11} />
        Delete
      </button>
    </div>
  );
});