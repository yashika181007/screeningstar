const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads"; // Original upload directory
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // Create directory if it doesn't exist
      console.log(`Directory created: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 10000); // Random number
    const extension = path.extname(file.originalname); // Get the file extension
    const filename = `${timestamp}_${randomNumber}${extension}`; // Create filename
    console.log(`Generated filename: ${filename}`);
    cb(null, filename); // Return the filename
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

// Function to save a single image
const saveImage = (file, targetDir) => {
  return new Promise((resolve, reject) => {
    if (file) {
      const originalPath = path.join("uploads", file.filename); // Original file path
      const newPath = path.join(targetDir, file.filename); // New file path

      console.log(`Moving file from ${originalPath} to ${newPath}`);

      // Move the file to the new directory
      fs.rename(originalPath, newPath, (err) => {
        if (err) {
          console.error(`Error moving file: ${err.message}`);
          return reject(err); // Reject on error
        }
        console.log(`File successfully saved to: ${newPath}`);
        resolve(newPath); // Return the new file path
      });
    } else {
      console.error("No file provided for saving.");
      reject(new Error("No file provided for saving."));
    }
  });
};

// Function to save multiple images
const saveImages = async (files, targetDir) => {
  const savedImagePaths = [];
  for (const file of files) {
    try {
      const savedImagePath = await saveImage(file, targetDir); // Save each file
      savedImagePaths.push(savedImagePath);
    } catch (error) {
      console.error(`Error saving image: ${error.message}`);
    }
  }
  return savedImagePaths; // Return an array of saved image paths
};

// Exporting the upload middleware and saving functions
module.exports = {
  upload: upload.fields([
    { name: "images", maxCount: 10 }, // Field for multiple images
    { name: "image", maxCount: 1 },   // Field for a single image
  ]),
  saveImage,
  saveImages,
};
