const mongoose = require("mongoose")

const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2')

const incomeSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true,
    },
    month: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    total_supply: {
        items: {
            type: Number,
            default: 0,
            required: true,
        },
        payments: {
            type: Number,
            default: 0,
            required: true,
        }
    },

    web_order_sale: {
        items: {
            type: Number,
            default: 0,
            required: true,
        },
        payments: {
            type: Number,
            default: 0,
            required: true,
        }
    },
    total_income: {
        type: Number,
        required: true,
    }
})

incomeSchema.plugin(timestamps);
incomeSchema.plugin(pagination);

exports.Income = mongoose.model('Income', incomeSchema);