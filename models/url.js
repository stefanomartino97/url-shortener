const mongoose = require('mongoose');

const url = mongoose.Schema({
    long: { type: String, required: true },
    short: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    visits: { type: Number, default: 0 }
});

const Url = mongoose.model('URL', url);
module.exports = Url;