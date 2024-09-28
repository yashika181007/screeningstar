const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');
const multer = require('multer');

// Multer memory storage
const storage = multer.memoryStorage(); 

// File type checking function
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

// Multer upload configuration
const uploaduserphoto = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('employeePhoto');

// FTP upload function
const uploadToRemote = async (fileBuffer, remotePath) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    let tempFilePath = '';

    try {
        // Generate a unique filename and create a temporary file
        tempFilePath = path.join(__dirname, 'temp', Date.now() + '.tmp');
        
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }

        fs.writeFileSync(tempFilePath, fileBuffer);

        // FTP connection details
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

module.exports.uploaduserphoto = (req, res) => {
    uploaduserphoto(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'File upload error', error: err });
        }

        const uniqueFileName = Date.now() + path.extname(req.file.originalname).toLowerCase();
        const remotePath = `demo/screening_star/uploads/${uniqueFileName}`;

        // Upload file with the generated name
        await uploadToRemote(req.file.buffer, remotePath);

        req.file.uploadedFileName = uniqueFileName; // Save the generated name for later use

        res.status(200).json({ 
            message: 'File uploaded successfully to remote server', 
            remotePath: `https://webstepdev.com/demo/screening_star/uploads/${uniqueFileName}` 
        });
    });
};
