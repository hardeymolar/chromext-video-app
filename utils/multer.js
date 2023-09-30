const multer = require('multer')

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video')){
        cb(null,true);
    }else {
         cb('please upload a video',false)
    }
}

const upload = multer({ storage, fileFilter });


module.exports = upload;