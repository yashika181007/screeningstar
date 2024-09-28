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
    
    let tempFilePath = '';

    try {
        tempFilePath = path.join(__dirname, 'temp', Date.now() + '.tmp');
        
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }

        fs.writeFileSync(tempFilePath, fileBuffer);
        
        await client.access({
            host: 'ftp.webstepdev.com',
            user: 'u510451310.dev123',
            password: 'Webs@0987#@!',
            secure: false
        });

        console.log('Connected to FTP server');

        await client.uploadFrom(tempFilePath, remotePath);
        console.log('File uploaded to remote server:', remotePath);
        
    } catch (err) {
        console.error('FTP upload error:', err);
    } finally {
        client.close();

        if (tempFilePath) {
            fs.unlink(tempFilePath, (err) => {
                if (err) {
                    console.error('Error deleting temporary file:', err);
                } else {
                    console.log('Temporary file deleted:', tempFilePath);
                }
            });
        }
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

        const remotePath = `demo/screening_star/uploads/${req.file.originalname}`;

        await uploadToRemote(req.file.buffer, remotePath);

        res.status(200).json({ message: 'File uploaded successfully to remote server', remotePath: `https://webstepdev.com/demo/screening_star/uploads/${req.file.originalname}` });
    });
};
