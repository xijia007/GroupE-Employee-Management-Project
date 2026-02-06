import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * 1. Directory Configuration
 * uploadDirectory: The physical path for storing files
 */
const uploadDirectory = './uploads/documents';

// Ensure the storage directory is automatically created when the server starts.
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

/**
 * 2. Storage Engine Configuration
 * Defines where the files are stored and what they are named.
 */
const storageConfiguration = multer.diskStorage({
    // Set the storage destination
    destination: function (req, file, callback) {
        callback(null, uploadDirectory);
    },

    // Set the file name generation rules
    filename: function (req, file, callback) {
        // Get the user ID from the request 
        // (usually provided by the previous authentication middleware)
        const userId = req.userId || 'anonymous';
        const currentTime = Date.now();

        // Extract the file extension (e.g., .pdf)
        const fileExtension = path.extname(file.originalname);

        // Extract the main filename (the name without the extension)
        const baseFileName = path.basename(file.originalname, fileExtension);

        // Concatenate to form a unique filename: UserID_Timestamp_OriginalName.Extension
        // Use replace to simply clean up spaces or special characters in the filename.
        const cleanedFileName = baseFileName.replace(/\s+/g, '_');
        const finalFileName = `${userId}_${currentTime}_${cleanedFileName}${fileExtension}`;

        callback(null, finalFileName);
    }
});

/**
 * 3. File Filter
 * Restricts the file formats that users can upload.
 */
const fileTypeFilter = (req, file, callback) => {
    // Define allowed file extensions
    const allowedPattern = /jpeg|jpg|png|pdf|doc|docx/;

    // Validate file extension for security (eg: .jpg, .png, .pdf)
    const isExtensionValid = allowedPattern.test(path.extname(file.originalname).toLowerCase());

     // Validate MIME type for security (eg: image/jpeg, application/pdf)
    const isMimeTypeValid = allowedPattern.test(file.mimetype);

    if (isExtensionValid && isMimeTypeValid) {
        return callback(null, true);
    } else {
        // Return an error if the format is not supported
        callback(new Error(
            'Only .png, .jpg, .jpeg, .pdf, .doc and .docx files are allowed.'
        ));
    }
};

/**
 * 4. Multer Instance Initialization
 */
const upload = multer({
    storage: storageConfiguration,
    limits: {
        files: 5 * 1024 * 1024 // Limit file size to 5MB
    },
    fileFilter: fileTypeFilter
});

/**
 * 5. Exported Middleware Interfaces 
 */

// Single file upload (expects form field name to be 'file')
export const uploadSingleFile = upload.single('file');

// Multiple files upload (specific fields)
export const uploadRequiredDocuments = upload.fields([
    { name: 'driverLicense', maxCount: 1 },
    { name: 'workAuthorization', maxCount: 1},
    { name: 'other', maxCount: 1 }
]);

export default upload;