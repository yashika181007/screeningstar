const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';  // Local directory for uploads

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

// Multer upload configuration
const uploaduserphoto = multer({
    storage: storage,
    limits: { fileSize: 1000000 },  // Limit file size to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('employeePhoto');

// FTP upload function using `basic-ftp`
const uploadToRemote = async (localPath, remotePath) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;  // Optional: Verbose logging to see the FTP process

    try {
        await client.access({
            host: 'ftp.webstepdev.com',  // Replace with your FTP host
            user: 'u510451310.dev123',  // Replace with your FTP username
            password: 'Webs@0987#@!',  // Replace with your FTP password
            secure: false  // Set to true if you want to use FTPS
        });

        console.log('Connected to FTP server');
        
        // Upload the local file to the specified remote path
        await client.uploadFrom(localPath, remotePath);
        console.log('File uploaded to remote server:', remotePath);
        
    } catch (err) {
        console.error('FTP upload error:', err);
    } finally {
        client.close();  // Close the FTP connection
    }
};

// Controller function to handle file upload and FTP transfer
module.exports.uploaduserphoto = (req, res) => {
    uploaduserphoto(req, res, async (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        console.log('Uploaded file locally:', req.file);

        const localPath = path.join(__dirname, 'uploads', req.file.filename);  // Local path to the file
        const remotePath = `https://webstepdev.com/demo/screening_star/uploads/${req.file.filename}`;  // Remote path for the file

        // Upload the file to the remote FTP server
        await uploadToRemote(localPath, remotePath);

        // Return success response
        res.status(200).json({ message: 'File uploaded successfully to remote server' });
    });
};
