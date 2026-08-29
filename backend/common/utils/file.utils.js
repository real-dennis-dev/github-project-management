const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

class FileUtils {
  constructor() {
    this.uploadDir = path.join(__dirname, "../../uploads");
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating upload directory:", error);
    }
  }

  // Uploads file
  uploadFile(file, destination = "") {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = path.join(this.uploadDir, destination);
        fs.mkdir(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueName = this.generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
      },
    });

    return multer({
      storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB default
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "application/pdf",
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("Invalid file type"), false);
        }
      },
    });
  }

  // Deletes file
  async deleteFile(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  // Validates file type
  validateFileType(file, allowedTypes) {
    if (!file) return false;
    return allowedTypes.includes(file.mimetype);
  }

  // Validates file size
  validateFileSize(file, maxSize = 5 * 1024 * 1024) {
    if (!file) return false;
    return file.size <= maxSize;
  }

  // Generates unique filename
  generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    return `${name}-${timestamp}-${random}${ext}`;
  }

  // Gets file info
  async getFileInfo(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      const stats = await fs.stat(fullPath);
      return {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
      };
    } catch (error) {
      return null;
    }
  }

  // Reads file content
  async readFile(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      return await fs.readFile(fullPath);
    } catch (error) {
      return null;
    }
  }

  // Writes file content
  async writeFile(filePath, data) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.writeFile(fullPath, data);
      return true;
    } catch (error) {
      return false;
    }
  }
}

const fileUtils = new FileUtils();

module.exports = fileUtils;
module.exports.fileUtils = fileUtils;
