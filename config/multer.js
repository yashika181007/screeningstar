optimize
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');
const multer = require('multer');

// Use memory storage for both uploads
const storage = multer.memoryStorage(); 

// Helper function to check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Multer upload handler for employeePhoto
const uploadEmployeePhoto = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB file size limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('employeePhoto');

// Multer upload handler for clientLogo
const uploadClientLogo = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB file size limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('clientLogo');

// FTP upload function
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
        throw err; // Re-throw error for proper handling
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

const uploaduserphoto = (req, res, next) => {
    uploadEmployeePhoto(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        const uniqueFileName = Date.now() + path.extname(req.file.originalname).toLowerCase();
        const remotePath = `demo/screening_star/uploads/${uniqueFileName}`;

        try {
            await uploadToRemote(req.file.buffer, remotePath);
            req.file.uploadedFileName = uniqueFileName;
            next(); // Proceed to the next middleware
        } catch (uploadErr) {
            return res.status(500).json({ message: 'File upload failed', error: uploadErr });
        }
    });
};

const clientlogoupload = (req, res, next) => {
    uploadClientLogo(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        const uniqueFileName1 = Date.now() + path.extname(req.file.originalname).toLowerCase();
        const remotePath1 = `demo/screening_star/uploads/${uniqueFileName1}`;

        try {
            await uploadToRemote(req.file.buffer, remotePath1);
            req.file.uploadedFileName1 = uniqueFileName1;
            next();
        } catch (uploadErr) {
            console.error('FTP upload error:', uploadErr);
            return res.status(500).json({ message: 'File upload failed', error: uploadErr });
        }
    });
};

module.exports = {
    uploaduserphoto,
    clientlogoupload
};
