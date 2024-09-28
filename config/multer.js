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
const uploadToRemote = async (fileBuffer, remotePath) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    let tempFilePath = '';

    try {
        tempFilePath = path.join(__dirname, 'temp', Date.now() + '.tmp');
        
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }

        fs.writeFileSync(tempFilePath, fileBuffer);
        await client.access({
            host: process.env.FTP_HOST,      
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
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
const upload = (fieldName) => multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB file size limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single(fieldName);  

const uploadFile = (fieldName) => (req, res, next) => {
    upload(fieldName)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        const uniqueFileName = Date.now() + path.extname(req.file.originalname).toLowerCase();
        const remotePath = `demo/screening_star/uploads/${uniqueFileName}`;

        await uploadToRemote(req.file.buffer, remotePath);

        req.file.uploadedFileName = uniqueFileName; 
        res.status(200).json({ 
            message: 'File uploaded successfully to remote server', 
            remotePath: `https://webstepdev.com/demo/screening_star/uploads/${uniqueFileName}` 
        });
    });
};

module.exports = {
    uploaduserphoto: uploadFile('employeePhoto'),
    clientlogoupload: uploadFile('clientLogo')
};
