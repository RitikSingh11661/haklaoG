const mongoose = require("mongoose");

const schema = mongoose.Schema({
    userId: {type:String,require: true},
    againstUserId: { type: String, require: true},
    reason: { type: String, require: true},
    description: {type: String},
}, { timestamps: true })

const reportModel = mongoose.model("report", schema);

module.exports = { reportModel };