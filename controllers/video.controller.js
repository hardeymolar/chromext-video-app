require('dotenv').config();
const { videoUploader } = require('../utils/videoUploader');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const video = require('../models/video.model');
const { downloadAndTranscribe } = require('../utils/transcript');
const { sendVideoToEmail } = require('../utils/mailer/email.service');
const SITEURL = process.env.SITEURL;

const uploadVideo = async (req, res, next) => {
    try {
        const videoUrl = req.body.videoUrl;
        if (!videoUrl) {
            throw new BadRequestError('Please provide a video');
        }
        const timeStamp = Date.now()
        const videoName = `untitled_video_${timeStamp}.mp4`
        await videoUploader(videoName, videoUrl);
        const videoTranscript = await downloadAndTranscribe(videoUrl);
        let dataToSave = {
            videoName,
            publicLink: `${SITEURL}/${videoName}`,
            videoUrl,
            videoTranscript,
        }
        const saveVideo = await video.create(dataToSave);
        res.status(StatusCodes.CREATED).json({
            status: "success",
            video: saveVideo,
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
        res.status(StatusCodes.OK).json({
             status: "success", 
             video: videoDetails })
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