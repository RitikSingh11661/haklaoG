const express = require("express");
const {callModel} = require("../models/call.model")
const callRoutes = express.Router();

callRoutes.get("/", async (req, res) => {
    try {
        let data = await callModel.find();
        res.status(200).send({ data, status: "success" });
    } catch (e) {
        res.status(400).send({ msg: e })
    }
})

callRoutes.get("/:id", async (req, res) => {
    try {
        const data = await callModel.findById(req.params._id);
        res.status(200).send({ data, status: "success" });
    } catch (e) {
        res.status(400).send({ msg: e })
    }
})

callRoutes.post("/add", async (req, res) => {
    const {userId:caller,callee} = req.body;
    try {
        const newCall = new callModel({caller,callee});
        await newCall.save().then(res=>console.log('res',res)).catch(err=>console.log('err in call',err));
        res.status(200).send({ msg: "Call has initialised", status: "success"});
    } catch (error) {
        console.log('call in backend error',call)
        res.status(400).send({ msg:error});
    }
})

callRoutes.patch("/update/:id", async (req, res) => {
    try {
        const call = await callModel.findByIdAndUpdate(req.params.id, req.body.feedback);
        res.status(200).send({ data: call, msg: "Call details has been updated", status: "success" });
    } catch (e) {
        console.log('e in update', e)
        res.status(400).send({ msg: e });
    }
})

module.exports = {callRoutes};