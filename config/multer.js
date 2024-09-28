const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ftp = require('basic-ftp');

// Use memory storage to handle uploads in memory
const storage = multer.memoryStorage(); 

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

// Override the filename method to include the timestamp
uploaduserphoto.filename = (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);  // Pass the unique filename
};

module.exports = {
    uploaduserphoto,
    uploadToRemote,
};
