const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        
        // Check if the directory exists
        if (!fs.existsSync(uploadPath)) {
            // If it doesn't exist, create it
            fs.mkdirSync(uploadPath, { recursive: true });
            console.log('Directory created:', uploadPath);
        }

        // Check if the directory has write permissions
        fs.access(uploadPath, fs.constants.W_OK, (err) => {
            if (err) {
                console.log('No write permissions for directory:', uploadPath);
                return cb('Error: No write permissions for the upload directory');
            }
            console.log('Write permission check passed for:', uploadPath);  // Log if the directory has write permission
            cb(null, uploadPath);
        });
    },
    filename: function (req, file, cb) {
        const uniqueFileName = Date.now() + path.extname(file.originalname);
        console.log('Generated file name:', uniqueFileName);  // Log the generated file name
        cb(null, uniqueFileName);
    }
});

// File filter function
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    console.log('File mimetype:', file.mimetype);  // Log the file's mimetype
    console.log('File extension:', path.extname(file.originalname).toLowerCase());  // Log the file's extension

    if (mimetype && extname) {
        cb(null, true); 
    } else {
        console.log('Error: Invalid file type!');  // Log if there is an error
        cb('Error: Images Only!'); 
    }
}

// Multer upload configurations
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },  // Limit file size to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('clientLogo');

const uploaduserphoto = multer({
    storage: storage,
    limits: { fileSize: 1000000 },  // Limit file size to 1MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('employeePhoto'); 

// Export the upload functions
module.exports = {
    upload,
    uploaduserphoto
};
