const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');

// Multer memory storage configuration
const storage = multer.memoryStorage(); // Use memory storage to avoid local storage

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

// Multer upload configuration
const uploaduserphoto = multer({
    storage: storage,
    limits: { fileSize: 1000000 },  // Limit file size to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('employeePhoto');

// FTP upload function using `basic-ftp`
const uploadToRemote = async (fileBuffer, remotePath) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;  // Optional: Verbose logging to see the FTP process

    try {
        // Create a temporary file path
        const tempFilePath = path.join(__dirname, 'temp', Date.now() + '.tmp');
        
        // Ensure the temp directory exists
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }

        // Write the buffer to the temporary file
        fs.writeFileSync(tempFilePath, fileBuffer);
        
        await client.access({
            host: 'ftp.webstepdev.com',  // Replace with your FTP host
            user: 'u510451310.dev123',  // Replace with your FTP username
            password: 'Webs@0987#@!',  // Replace with your FTP password
            secure: false  // Set to true if you want to use FTPS
        });

        console.log('Connected to FTP server');

        // Upload the temporary file to the specified remote path
        await client.uploadFrom(tempFilePath, remotePath);
        console.log('File uploaded to remote server:', remotePath);
        
    } catch (err) {
        console.error('FTP upload error:', err);
    } finally {
        client.close();  // Close the FTP connection

        // Remove the temporary file
        fs.unlink(tempFilePath, (err) => {
            if (err) {
                console.error('Error deleting temporary file:', err);
            } else {
                console.log('Temporary file deleted:', tempFilePath);
            }
        });
    }
};

// Controller function to handle file upload and FTP transfer
module.exports.uploaduserphoto = (req, res) => {
    uploaduserphoto(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        console.log('Uploaded file:', req.file);

        // Construct the remote path using the original filename
        const remotePath = `demo/screening_star/uploads/${req.file.originalname}`;  // Remote path for the file

        // Upload the file to the remote FTP server
        await uploadToRemote(req.file.buffer, remotePath);

        // Return success response
        res.status(200).json({ message: 'File uploaded successfully to remote server', remotePath: `https://webstepdev.com/demo/screening_star/uploads/${req.file.originalname}` });
    });
};
