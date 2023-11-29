const mongoose = require("mongoose");

const schema = mongoose.Schema({
    caller: { type: String, require: true },
    callee: { type: String, require: true },
    feedback: {type: String, default:''}
}, { timestamps: true })

const callModel = mongoose.model("call", schema);

module.exports = { callModel };