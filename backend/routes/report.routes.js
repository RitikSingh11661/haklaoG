const express = require("express");
const {reportModel} = require("../models/report.model")
const reportRoutes = express.Router();

reportRoutes.get("/", async (req, res) => {
    try {
        let data = await reportModel.find();
        res.status(200).send({ data, status: "success" });
    } catch (e) {
        res.status(400).send({ msg: e })
    }
})

reportRoutes.get("/:id", async (req, res) => {
    try {
        const data = await reportModel.findById(req.params._id);
        res.status(200).send({ data, status: "success" });
    } catch (e) {
        res.status(400).send({ msg: e })
    }
})

reportRoutes.post("/add", async (req, res) => {
    const { userId, againstUserId, reason, description } = req.body;
    const report = { userId, againstUserId, reason };
    if (description) report.description = description;
    try {
        const newReport = new reportModel(report);
        await newReport.save().then(res=>console.log('res',res)).catch(err=>console.log('err in report',err));
        res.status(200).send({ msg: "Report has been registered", status: "success"});
    } catch (error) {
        console.log('report in backend error',report)
        res.status(400).send({ msg:error});
    }
})

module.exports = {reportRoutes};