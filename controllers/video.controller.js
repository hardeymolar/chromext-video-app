require('dotenv').config();
const { videoUploader } = require('../utils/cloudinary');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const video = require('../models/video.model');
const { downloadAndTranscribe } = require('../utils/transcript');
const { sendVideoToEmail } = require('../utils/mailer/email.service');
const SITEURL = process.env.SITEURL;

const uploadVideo = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new BadRequestError('Please provide a file');
        }
        const timeStamp = Date.now()
        const path = req.file.path;
        const videoLink = await videoUploader(timeStamp, path);
        const videoName = `untitled_video_${timeStamp}`
        const videoTranscript = await downloadAndTranscribe(videoLink);
        let dataToSave = {
            videoName,
            publicLink: `${SITEURL}/${videoName}`,
            videoUrl: videoLink,
            videoTranscript,
        }
        const saveVideo = await video.create(dataToSave);
        res.status(StatusCodes.CREATED).json({
            status: "success",
            videoName: videoName,
            videoUrl: dataToSave.publicLink,
            transcript: videoTranscript
        })
    } catch (error) {
        console.log(error);
        next(error);
    }
}

const getVideo = async (req, res, next) => {
    try {
        const videoName = req.params.videoName;
        const videoDetails = await video.findOne({ videoName });
        if (!videoDetails) {
            throw new NotFoundError("File Not Found");
        }
        const Video = videoDetails.videoUrl;
        res.status(StatusCodes.OK).json({ status: "success", Video })
    } catch (error) {
        next(error);
    }
}
const sendVideo = async (req, res) => {
    try {
        const videoName = req.params.videoName;
        const email = req.body.email;
        if (!email) {
            throw new BadRequestError("Please provide an email");
        }
        const Video = `${SITEURL}/${videoName}`;
        await sendVideoToEmail(email, Video);
        res.status(StatusCodes.OK).json({ status: "success", message: `Your video link has been sent to ${email}` })
    } catch (error) {
        next(error);
    }
}



module.exports = { uploadVideo, getVideo, sendVideo }