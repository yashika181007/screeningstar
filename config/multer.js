const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Client = require('ssh2-sftp-client');  // Import the SFTP client

const sftp = new Client();  // Create a new SFTP client instance

// Storage configuration for local storage (temporary before uploading to the server)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';  // Local folder for storing the file

        // Check if the local directory exists, if not, create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
            console.log('Directory created:', uploadPath);
        }

        // Check if the directory has write permissions
        fs.access(uploadPath, fs.constants.W_OK, (err) => {
            if (err) {
                console.log('No write permissions for directory:', uploadPath);
                return cb('Error: No write permissions for the upload directory');
            }
            console.log('Write permission check passed for:', uploadPath);
            cb(null, uploadPath);  // Pass the directory where the file will be saved
        });
    },
    filename: function (req, file, cb) {
        const uniqueFileName = Date.now() + path.extname(file.originalname);
        console.log('Generated file name:', uniqueFileName);
        cb(null, uniqueFileName);  // Assign a unique filename
    }
});

// File filter function to allow only images
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        console.log('Error: Invalid file type!');
        cb('Error: Images Only!');
    }
}

// Multer upload configurations
const uploaduserphoto = multer({
    storage: storage,
    limits: { fileSize: 1000000 },  // Limit file size to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('employeePhoto');

// SFTP Upload Function
const uploadToRemote = async (localPath, remotePath) => {
    try {
        await sftp.connect({
            host: 'ftp.webstepdev.com',  // Replace with your FTP host
            username: 'u510451310.dev123',  // Replace with your FTP username
            password: 'Webs@0987#@!',  // Replace with your FTP password
        });

        // Upload the file
        await sftp.put(localPath, remotePath);
        console.log('File uploaded to remote server:', remotePath);

        await sftp.end();  // Close the SFTP connection
    } catch (err) {
        console.error('SFTP upload error:', err);
    }
};

// Controller function to handle file upload and transfer to remote server
module.exports.uploaduserphoto = (req, res) => {
    uploaduserphoto(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        console.log('Uploaded file locally:', req.file);

        const localPath = path.join(__dirname, 'uploads', req.file.filename);
        const remotePath = `/demo/screening_star/uploads/${req.file.filename}`;  // Remote path for the file

        // Upload the file to the remote server
        await uploadToRemote(localPath, remotePath);

        // Return success response
        res.status(200).json({ message: 'File uploaded successfully to remote server' });
    });
};
