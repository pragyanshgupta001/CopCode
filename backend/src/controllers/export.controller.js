import archiver    from "archiver";
import Room        from "../models/room.model.js";
import FileContent from "../models/file.content.model.js";

export const exportRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId     = req.user._id;

    const room = await Room.findOne({ roomId, isActive: true });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isMember = room.members.some(
      (m) => m.user.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this room" });
    }

    const allContents = await FileContent.find({ roomId }).lean();

    const contentMap = {};
    for (const fc of allContents) {
      contentMap[fc.path] = fc.content || "";
    }

    const zipName = `${room.name.replace(/[^a-z0-9]/gi, "-")}.zip`;

    res.setHeader("Content-Type",        "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);

    const archive = archiver("zip", {
      zlib: { level: 6 },
    });

    archive.pipe(res);

    const files = room.fileTree.filter((node) => node.type === "file");

    if (files.length === 0) {
      archive.append("# This room has no files yet\n", {
        name: "README.md",
      });
    } else {
      for (const file of files) {
        const content = contentMap[file.path] || "";
        const zipPath = file.path.replace(/^\//, "");

        archive.append(content, { name: zipPath });
      }
    }

    await archive.finalize();

  } catch (error) {
    console.error("exportRoom error:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Failed to export project" });
    }
  }
};