import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";

const DEFAULT_BUCKET_NAME = "uploads";

function requireDb() {
  const db = mongoose.connection?.db;
  if (!db) {
    throw new Error(
      "MongoDB connection not ready. Ensure connectDB() completed before using GridFS.",
    );
  }
  return db;
}

export function toObjectId(value) {
  if (value instanceof ObjectId) return value;
  if (typeof value !== "string" || !ObjectId.isValid(value)) return null;
  return new ObjectId(value);
}

export function getGridFSBucket(bucketName = DEFAULT_BUCKET_NAME) {
  const db = requireDb();
  return new GridFSBucket(db, { bucketName });
}

export async function uploadBufferToGridFS({
  buffer,
  filename,
  contentType,
  metadata = {},
  bucketName = DEFAULT_BUCKET_NAME,
}) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("uploadBufferToGridFS: buffer must be a Buffer");
  }
  const bucket = getGridFSBucket(bucketName);

  return await new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename || "upload", {
      metadata: {
        ...metadata,
        contentType:
          contentType || metadata?.contentType || "application/octet-stream",
        originalName: filename || metadata?.originalName || "upload",
      },
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id));
    uploadStream.end(buffer);
  });
}

export async function findGridFSFileById(
  fileId,
  bucketName = DEFAULT_BUCKET_NAME,
) {
  const bucket = getGridFSBucket(bucketName);
  const _id = toObjectId(fileId);
  if (!_id) return null;
  const files = await bucket.find({ _id }).limit(1).toArray();
  return files?.[0] || null;
}

export function openGridFSDownloadStream(
  fileId,
  bucketName = DEFAULT_BUCKET_NAME,
) {
  const bucket = getGridFSBucket(bucketName);
  const _id = toObjectId(fileId);
  if (!_id) return null;
  return bucket.openDownloadStream(_id);
}
