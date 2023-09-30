const {uploadVideo,getVideo, sendVideo} = require('../controllers/video.controller')
const upload = require('../utils/multer')

const express = require('express')
const router = express.Router();

router.post('/videos',upload.single('recorded-video'),uploadVideo);
router.get('/:videoName',getVideo);
router.post('/send/:videoName',sendVideo);

module.exports = router