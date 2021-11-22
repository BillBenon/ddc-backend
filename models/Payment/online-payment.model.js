const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
Joi.objectId = require('joi-objectid')(Joi);
const pagination = require('mongoose-paginate-v2');
const {PAYMENT_SOURCE_ENUM, TELECOM_ENUM} = require("../../utils/enumerations/constants");
const {CHANNEL_TYPE_ENUM} = require("../../utils/enumerations/constants");
const {PAYMENT_STATUS_ENUM} = require("../../utils/enumerations/constants");
const {getEnumFromObject} = require("../../utils/common");
const {DIGIT_PATTERN} = require("../../utils/enumerations/constants");
const {AppliedDiscount} = require("../../models/Discount/applied-discount.model");
const {OrderDiscount} = require("../../models/Discount/order-discount.model");
const {
    APPLIED_DISCOUNT_STATUS_ENUM,
    ORDER_DISCOUNT_STATUS_ENUM,
    ORDER_DISCOUNT_SCOPE_ENUM
} = require("../../utils/enumerations/constants");


/**
 * @swagger
 * definitions:
 *   OnlinePayment:
 *     properties:
 *       _id:
 *         type: string
 *       order:
 *         type: string
 *       discount:
 *         type: number
 *       msisdn:
 *         type: string
 *       direct_purchase:
 *         type: string
 *       vat_percentage:
 *         type: number
 *       total_order_amount:
 *         type: number
 *       shipping_amount:
 *         type: number
 *       discount_amount:
 *         type: number
 *       total_VAT:
 *         type: number
 *       amountToPay:
 *         type: number
 *       channel:
 *         type: string
 *         required: true
 *       status:
 *         type: string
 *         enum: ['PENDING', 'PAID', 'CANCELLED', 'FAILED', 'POSTED', 'APPROVED']
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */

const onlinePaymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    applied_discounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AppliedDiscount',
        default: null
    }],
    msisdn: {
        type: String,
        required: true
    },
    shipping_amount: {
        type: Number,
        required: true,
        default: 0
    },
    discount_amount: {
        type: Number,
        required: true,
        default: 0,
    },
    amountPaid: {
        type: Number,
        required: true
    },
    channel: {
        type: String,
        enum: getEnumFromObject(CHANNEL_TYPE_ENUM),
        default: CHANNEL_TYPE_ENUM.WEB
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
    transactionId: {
        type: String
    },
    transactionReferenceId: {
        type: String
    },
    currency: {
        type: String,
        default: 'RWF'
    },
    telecom: {
        type: String,
        enum: getEnumFromObject(TELECOM_ENUM),
        default: TELECOM_ENUM.MTN
    },
    status: {
        type: String,
        enum: getEnumFromObject(PAYMENT_STATUS_ENUM),
        default: PAYMENT_STATUS_ENUM.INITIATED
    },
    source: {
        type: String,
        enum: getEnumFromObject(PAYMENT_SOURCE_ENUM)
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
});
onlinePaymentSchema.plugin(timestamps)
onlinePaymentSchema.plugin(pagination)

onlinePaymentSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.day;
    delete obj.week;
    delete obj.month;
    delete obj.year;
    return obj;
}


const OnlinePayment = mongoose.model('OnlinePayment', onlinePaymentSchema);

function validate(data) {
    const schema = {
        order: Joi.objectId().required(),
        msisdn: Joi.string().regex(DIGIT_PATTERN).min(12).max(12).required(),
        shipping_amount: Joi.number().min(0).required(),
        channel: Joi.string().valid(...getEnumFromObject(CHANNEL_TYPE_ENUM)),
        amountPaid: Joi.number().min(1).required(),
    };
    return Joi.validate(data, schema);
}

async function handleDiscountOnSave(saved, found_discounts) {

    for (let applied_discount_id of found_discounts) {

        let found_discount = await AppliedDiscount.findById(applied_discount_id);
        let order_discount = await OrderDiscount.findById(found_discount.order_discount);

        found_discount.status = APPLIED_DISCOUNT_STATUS_ENUM.ACTIVATED;
        order_discount.status = ORDER_DISCOUNT_STATUS_ENUM.ACTIVATED;

        if (order_discount.discount_scope === ORDER_DISCOUNT_SCOPE_ENUM.CUSTOMER_BASED) {
            let total_usages_per_customer = order_discount.total_usages + 1;
            order_discount.total_usages = total_usages_per_customer;

            if (order_discount.usage_count <= total_usages_per_customer) {
                order_discount.status = ORDER_DISCOUNT_STATUS_ENUM.USAGE_COUNT_EXPIRED;
                order_discount.active = false;
            }
        } else {
            order_discount.total_usages = order_discount.total_usages + 1;
        }
        await found_discount.save();
        await order_discount.save();
    }

    return OnlinePayment.findByIdAndUpdate(saved._id, {applied_discounts: found_discounts}, {new: true});
}

module.exports.handleDiscountOnSave = handleDiscountOnSave;
module.exports.OnlinePayment = OnlinePayment;
module.exports.validate = validate;


