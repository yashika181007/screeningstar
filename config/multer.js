const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');
const multer = require('multer');

// Use memory storage for uploads
const storage = multer.memoryStorage();

// Create temp directory on server startup if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Helper function to check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Error: Images Only!'));
    }
}

// FTP upload function
const uploadToRemote = async (fileBuffer, remotePath) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    const tempFilePath = path.join(tempDir, `${Date.now()}.tmp`);

    try {
        fs.writeFileSync(tempFilePath, fileBuffer);  // Write buffer to temp file
        await client.access({
            host: process.env.FTP_HOST,      // Use environment variables for credentials
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            secure: false
        });

        console.log('Connected to FTP server');
        await client.uploadFrom(tempFilePath, remotePath);
        console.log('File uploaded to remote server:', remotePath);
    } catch (err) {
        console.error('FTP upload error:', err);
        throw err;  // Re-throw error for proper handling
    } finally {
        client.close();
        // Clean up the temporary file
        fs.unlink(tempFilePath, (err) => {
            if (err) {
                console.error('Error deleting temporary file:', err);
            } else {
                console.log('Temporary file deleted:', tempFilePath);
            }
        });
    }
};

// General multer upload handler
const upload = (fieldName) => multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB file size limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single(fieldName);  // Use passed field name

// Unified photo upload handler
const uploadFile = (fieldName) => (req, res, next) => {
    upload(fieldName)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err.message });
        }

        const uniqueFileName = Date.now() + path.extname(req.file.originalname).toLowerCase();
        const remotePath = `demo/screening_star/uploads/${uniqueFileName}`;

        try {
            await uploadToRemote(req.file.buffer, remotePath);
            req.file.uploadedFileName = uniqueFileName;
            next();  // Proceed to the next middleware
        } catch (uploadErr) {
            console.error('FTP upload error:', uploadErr);
            return res.status(500).json({ message: 'File upload failed', error: uploadErr.message });
        }
    });
};

// Export handlers for specific upload fields
module.exports = {
    uploaduserphoto: uploadFile('employeePhoto'),
    clientlogoupload: uploadFile('clientLogo')
};
