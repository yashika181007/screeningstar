const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, 
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('clientLogo');

const uploaduserphoto = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, 
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('employeePhoto'); 

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true); 
    } else {
        cb('Error: Images Only!'); 
    }
}

module.exports = {
    upload,
    uploaduserphoto
};
