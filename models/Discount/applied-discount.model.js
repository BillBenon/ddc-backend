const mongoose = require('mongoose');
const {getEnumFromObject} = require("../../utils/common");

const {
    APPLIED_DISCOUNT_STATUS_ENUM,
    DURATION_TYPE_ENUM,
    ORDER_DISCOUNT_SCOPE_ENUM, ORDER_DISCOUNT_STATUS_ENUM,
    ORDER_DISCOUNT_TYPE_ENUM
} = require("../../utils/enumerations/constants");
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

/**
 * @swagger
 * definitions:
 *   AppliedDiscount:
 *     properties:
 *       _id:
 *         type: string
 *       order:
 *         type: string
 *       order_discount:
 *         type: string
 *       customer:
 *         type: string
 *       status:
 *         type: string
 *         enum: ['ACTIVATED','UNUSED', 'DURATION_EXPIRED', 'DELETED']
 *       active:
 *         type: boolean
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */



const appliedDiscountSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    order_discount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderDiscount',
        required: true
    },
    status: {
        type: String,
        enum: getEnumFromObject(APPLIED_DISCOUNT_STATUS_ENUM),
        default: APPLIED_DISCOUNT_STATUS_ENUM.UNUSED
    },
    active: {
        type: Boolean,
        default: true
    }
});
appliedDiscountSchema.plugin(timestamps)
appliedDiscountSchema.plugin(pagination)


const AppliedDiscount = mongoose.model('AppliedDiscount', appliedDiscountSchema);


function validateAppliedDiscount(data) {
    const schema = {
        customer: Joi.objectId().required(),
        order_discount: Joi.objectId().required(),
        order: Joi.objectId().required()
    };
    return Joi.validate(data, schema);
}



module.exports.AppliedDiscount = AppliedDiscount;
module.exports.validateAppliedDiscount = validateAppliedDiscount;
