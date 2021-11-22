const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
Joi.objectId = require('joi-objectid')(Joi);
const pagination = require('mongoose-paginate-v2');
const { CASH_PAYMENT_STATUS_ENUM } = require("../../utils/enumerations/constants");
const { CHANNEL_TYPE_ENUM } = require("../../utils/enumerations/constants");
const { getEnumFromObject } = require("../../utils/common");


/**
 * @swagger
 * definitions:
 *   CashPayment:
 *     properties:
 *       _id:
 *         type: string
 *       direct_purchase:
 *         type: string
 *       currency:
 *         type: string
 *       discount_amount:
 *         type: number
 *       amountPaid:
 *         type: number
 *       channel:
 *         type: string
 *         required: true
 *       status:
 *         type: string
 *         enum: ['PENDING', 'PAID', 'RETURNED']
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */

const schema = new mongoose.Schema({
    direct_purchase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DirectPurchaseFromMarket'
    },
    amountPaid: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'FRW'
    },
    channel: {
        type: String,
        enum: getEnumFromObject(CHANNEL_TYPE_ENUM),
        default: CHANNEL_TYPE_ENUM.DIRECT
    },
    day: {
        type: Number,
        required: true
    },
    week: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: getEnumFromObject(CASH_PAYMENT_STATUS_ENUM),
        default: CASH_PAYMENT_STATUS_ENUM.PAID
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
});
schema.plugin(timestamps)
schema.plugin(pagination)

schema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.day;
    delete obj.week;
    delete obj.month;
    delete obj.year;
    return obj;
}


exports.CashPayment = mongoose.model('CashPayment', schema);

exports.validate = (data) => {
    const schema = {
        amountPaid: Joi.number().min(1).required(),
        direct_purchase: Joi.objectId().required(),
        channel: Joi.string().valid(...getEnumFromObject(CHANNEL_TYPE_ENUM)),
    };
    return Joi.validate(data, schema);
}


