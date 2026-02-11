import {
  findGridFSFileById,
  openGridFSDownloadStream,
  toObjectId,
} from "../utils/gridfs.js";

function canAccessFile({ fileDoc, userId, userRole }) {
  if (!fileDoc) return false;
  if (userRole === "HR") return true;

  const owner = fileDoc?.metadata?.userId;
  if (!owner) return false;
  return String(owner) === String(userId);
}

export const streamFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const objectId = toObjectId(fileId);
    if (!objectId) {
      return res.status(400).json({ message: "Invalid file id" });
    }

    const fileDoc = await findGridFSFileById(objectId);
    if (!fileDoc) {
      return res.status(404).json({ message: "File not found" });
    }

    if (
      !canAccessFile({ fileDoc, userId: req.userId, userRole: req.userRole })
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const download = String(req.query.download || "").toLowerCase() === "1";
    const contentType =
      fileDoc?.metadata?.contentType ||
      fileDoc?.contentType ||
      "application/octet-stream";
    const filename =
      fileDoc?.metadata?.originalName || fileDoc?.filename || "download";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
    res.setHeader("Cache-Control", "private, max-age=0");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    const stream = openGridFSDownloadStream(objectId);
    if (!stream) {
      return res.status(500).json({ message: "Failed to open file stream" });
    }

    stream.on("error", (err) => {
      console.error("GridFS stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "File stream error" });
      } else {
        res.end();
      }
    });

    stream.pipe(res);
  } catch (err) {
    console.error("Stream file error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
