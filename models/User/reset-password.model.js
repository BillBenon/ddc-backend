const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const resetPassword = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    token: {
        type: String,
        required: true
    },
    reset: {
        type: Boolean,
        default: false
    },
    expiration: {
        type: Number,
        required: true
    }
})
resetPassword.plugin(timestamps);

exports.ResetPassword = mongoose.model('ResetPassword', resetPassword);
