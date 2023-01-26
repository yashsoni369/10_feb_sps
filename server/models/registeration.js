const mongoose = require('mongoose');

var registeration = new mongoose.Schema({
    'First Name': { type: String },
    'Middle Name': { type: String },
    'Last Name': { type: String },
    'Full Name': { type: String },
    'Mobile': { type: String },
    'Gender': { type: String },
    'Birth Date': { type: String },
    'Sabha': { type: String },
    'Ref Name': { type: String },
    'FollowUp Name': { type: String },
    isNew: Boolean
}, { timestamps: true });

module.exports = mongoose.model("registeration", registeration, "sps_2023_registerations");