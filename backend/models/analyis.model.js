const mongoose = require("mongoose");

const schema = mongoose.Schema({scheduleCount: Number,scheduleCountData: Object})

const analysis= mongoose.model("analyses", schema);

module.exports = {analysis};

const obj = {"scheduleCount":1};