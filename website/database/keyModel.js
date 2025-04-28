const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
    school: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: ""
    },
    keyTakenDate: {
        type: String,
        default: ""
    },
    keyTakenTime: {
        type: String,
        default: ""
    },
    keyGivenDate: {
        type: String,
        default: ""
    },
    keyGivenTime: {
        type: String,
        default: ""
    },
    isLocked: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Key', keySchema); 