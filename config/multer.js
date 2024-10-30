const multer = require('multer');
const path = require('path');

// Define storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save to 'uploads/' directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize `multer` with the storage configuration
const upload = multer({ storage: storage });

module.exports = upload;
