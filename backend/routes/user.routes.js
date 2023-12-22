const { userModel } = require("../models/user.model");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middlewares/auth.middleware");
const userRoutes = express.Router();
// const v4 = require("uuid").v4;
// const AWS = require('aws-sdk');
// const { decode } = require('base64-arraybuffer');
// const { promisify } = require('util');
// const fs = require("fs");
// const readFileAsync = promisify(fs.readFile);
// const { accessKeyId, secretAccessKey, region, bucketName } = process.env;
// const credential = { accessKeyId, secretAccessKey, region, signatureVersion: "v4" }
// const s3 = new AWS.S3(credential);

userRoutes.get("/:id", async (req, res) => {
    try {
        const data = await userModel.findById(req.params.id);
        res.status(200).send({ data, status: "success" });
    } catch (e) {
        res.status(400).send({ msg: e })
    }
})

userRoutes.post("/add", async (req, res) => {
    const { email, name, password, phone, kycVideo } = req.body;
    try {
        if (!email || !name || !password || !kycVideo) return res.status(400).send({ msg: "All the fields are required" });
        const preCheck = await userModel.findOne({ email: new RegExp(email, 'i') });
        if (preCheck) return res.status(400).send({ msg: "User already registered" });
        const hashedPassword = await bcrypt.hash(password, 7);
        const newUser = new userModel({ email, name, password: hashedPassword, phone, kycVideo });
        const user = await newUser.save();
        const token = jwt.sign({ "userId": user._id },process.env.secretKey);
        res.status(200).send({ msg: "User has been registered", status: "success", token });
    } catch (error) {
        console.log('error',error)
        res.status(400).send({ msg: "Error while registering user" });
    }
})

userRoutes.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).send({ msg: "Email and password are required" });
        const user = await userModel.findOne({email: new RegExp(email, 'i')});
        if (!user) return res.status(400).send({ msg: "User not found" });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(400).send({ msg: "Invalid password" });
        const token = jwt.sign({ "userId": user._id }, "revaluation");
        res.status(200).send({ msg: "User logged in", status: "success", token, verified: user.verified });
    } catch (e) {
        // console.log('e', e)
        res.status(400).send({ msg: e });
    }
})

//Route for user vido kyc, will implement later
// userRoutes.post("/kyc", async (req, res) => {
//     try {
//         const { videoLink } = req.body;
//         if (videoLink) {
//             const fileContent = await readFileAsync(videoLink);
//             const arrayBuffer = decode(fileContent);
//             const filename = `${v4()}-kycVideo.mp4`;
//             const params = { Bucket: bucketName, Key: filename, Body: arrayBuffer, ContentType: 'video/mp4' };
//             const s3Data = await s3.upload(params).promise();
//             console.log('s3Data', s3Data)
//             res.status(200).send({ msg: "Video has been added", status: "success" });
//         } else res.status(400).send({ msg: "Video is not present" });
//     } catch (error) {
//         res.status(400).send({ msg: "Error while uploading the video in aws" });
//     }
// })

userRoutes.use(verifyToken);

userRoutes.get("/", async (req, res) => {
    // const status = req.query.onlineUsers;
    try {
        let data = await userModel.find();
        res.status(200).send({ data, status: "success" });
    } catch (e) {
        res.status(400).send({ msg: e })
    }
})

userRoutes.delete("/delete/:id", async (req, res) => {
    try {
        await userModel.findByIdAndDelete(req.params.id);
        res.status(200).send({ msg: "User has been deleted", status: "success" });
    } catch (e) {
        res.status(400).send({ msg: e });
    }
})

userRoutes.patch("/update/:id", async (req, res) => {
    try {
        const user = await userModel.findByIdAndUpdate(req.params.id, req.body ,{returnDocument:'after'});
        res.status(200).send({ data: user, msg: "User details has been updated", status: "success" });
    } catch (e) {
        res.status(400).send({ msg: e });
    }
})

module.exports = { userRoutes };