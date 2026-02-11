import multer from "multer";
import path from "path";

/**
 * 3. File Filter
 * Restricts the file formats that users can upload.
 */
const fileTypeFilter = (req, file, callback) => {
  // Define allowed file extensions
  const allowedPattern = /jpeg|jpg|png|pdf|doc|docx/;

  // Validate file extension for security (eg: .jpg, .png, .pdf)
  const isExtensionValid = allowedPattern.test(
    path.extname(file.originalname).toLowerCase(),
  );

  // Validate MIME type for security (eg: image/jpeg, application/pdf)
  const isMimeTypeValid = allowedPattern.test(file.mimetype);

  if (isExtensionValid && isMimeTypeValid) {
    return callback(null, true);
  } else {
    // Return an error if the format is not supported
    callback(
      new Error(
        "Only .png, .jpg, .jpeg, .pdf, .doc and .docx files are allowed.",
      ),
    );
  }
};

/**
 * 4. Multer Instance Initialization
 */
const upload = multer({
  // Store in memory so controllers can persist to DB (GridFS)
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileTypeFilter,
});

/**
 * 5. Exported Middleware Interfaces
 */

// Single file upload (expects form field name to be 'file')
export const uploadSingleFile = upload.single("file");

// Multiple files upload (specific fields)
export const uploadRequiredDocuments = upload.fields([
  { name: "driverLicense", maxCount: 1 },
  { name: "workAuthorization", maxCount: 1 },
  { name: "other", maxCount: 1 },
  { name: "profilePicture", maxCount: 1 },
  { name: "optReceipt", maxCount: 1 },
]);

export default upload;
