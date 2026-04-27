import FolderNode from "./FolderNode";
import FileNode   from "./FileNode";

export default function FileTree({
  fileTree, activeFile, onOpenFile,
  onDelete, onRename,
  onNewFile, onNewFolder,
  onOpenInWorkspace,  // NEW: pass to FileNode
  onMoveFile,         // NEW: drag-and-drop
  roomName,
}) {
  const rootItems = buildTree(fileTree, null);

  const sharedProps = {
    allNodes: fileTree,
    activeFile,
    onOpenFile,
    onDelete,
    onRename,
    onNewFile,
    onNewFolder,
    onOpenInWorkspace,
    onMoveFile,
  };

  return (
    <div className="py-1">
      {/* root label */}
      <div className="flex items-center gap-1 px-2 py-0.5">
        <span className="font-mono text-[10px] text-gray-500 tracking-widest uppercase truncate">
          {roomName || "root"}
        </span>
      </div>

      {rootItems.length === 0 ? (
        <div className="px-4 py-4 text-center">
          <p className="font-mono text-[10px] text-gray-600">No files yet</p>
          <p className="font-mono text-[10px] text-gray-700 mt-0.5">Use +F or +D to create</p>
        </div>
      ) : (
        rootItems.map((node) =>
          node.type === "folder" ? (
            <FolderNode key={node._id || node.path} node={node} depth={0} {...sharedProps} />
          ) : (
            <FileNode
              key={node._id || node.path}
              node={node}
              depth={0}
              activeFile={activeFile}
              onOpenFile={onOpenFile}
              onDelete={onDelete}
              onRename={onRename}
              onOpenInWorkspace={onOpenInWorkspace}
              onFileDrop={onMoveFile}
            />
          )
        )
      )}
    </div>
  );
}

// exported so FolderNode can use it
export function buildTree(nodes, parentPath) {
  return (nodes || [])
    .filter((n) => n.parentPath === parentPath)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}