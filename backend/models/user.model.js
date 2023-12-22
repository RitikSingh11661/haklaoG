const mongoose = require("mongoose");

const schema = mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true },
    phone: { type: String, require: true },
    password: { type: String, require: true },
    image: { type: String, default: '' },
    kycVideo: { type: String, require: true },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: [{ type: Object, default: [] }],
    availableForCall: { type: Boolean, default: false }
}, { timestamps: true })

// Convert email to lowercase before saving
schema.pre('save', function(next) {
    this.email = this.email.toLowerCase();
    next();
});

const userModel = mongoose.model("user", schema);

module.exports = { userModel };
