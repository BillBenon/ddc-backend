const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
const {getEnumFromObject} = require("../../utils/common");
const {ORDER_DISCOUNT_STATUS_ENUM, ORDER_DISCOUNT_TYPE_ENUM} = require("../../utils/enumerations/constants");
const {ORDER_DISCOUNT_SCOPE_ENUM} = require("../../utils/enumerations/constants");
const {DURATION_TYPE_ENUM} = require("../../utils/enumerations/constants");
const {AppliedDiscount} = require("./applied-discount.model");
const {AppliedPartOrderCouponCode} = require("./applied-discount.model");
const {API_RESPONSE} = require("../../utils/common");
const {APPLIED_DISCOUNT_STATUS_ENUM} = require("../../utils/enumerations/constants");
const {getDuration} = require("../../utils/common");
Joi.objectId = require('joi-objectid')(Joi);


/**
 * @swagger
 * definitions:
 *   Discount:
 *     properties:
 *       _id:
 *         type: string
 *       coupon_code:
 *         type: string
 *       discount_type:
 *         type: string
 *         enum:  ['GENERAL', 'CUSTOMER_BASED', 'SPART_PART_BASED']
 *       usage_count:
 *         type: number
 *       duration_type:
 *         type: string
 *         enum: ['SECONDS', 'MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS', 'YEARS']
 *       duration:
 *         type: number
 *       discount:
 *         type: number
 *       customer:
 *         type: string
 *       part:
 *         type: string
 *       status:
 *         type: string
 *         enum: ['UNUSED', 'USAGE_COUNT_EXPIRED', 'DURATION_EXPIRED', 'DELETED']
 *       active:
 *         type: boolean
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */


const discountSchema = new mongoose.Schema({
    coupon_code: {
        type: String,
        unique: true,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    message: {
        type: String,
        default: null
    },
    discount_scope: {
        type: String,
        enum: getEnumFromObject(ORDER_DISCOUNT_SCOPE_ENUM),
        default: ORDER_DISCOUNT_SCOPE_ENUM.GENERAL
    },
    discount_type: {
        type: String,
        enum: getEnumFromObject(ORDER_DISCOUNT_TYPE_ENUM)
    },
    usage_count: {
        type: Number,
        required: true
    },
    total_usages: {
        type: Number,
        default: 0
    },
    duration_type: {
        type: String,
        enum: getEnumFromObject(DURATION_TYPE_ENUM),
        default: DURATION_TYPE_ENUM.DAYS
    },
    duration: {
        type: Number,
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    discount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: getEnumFromObject(ORDER_DISCOUNT_STATUS_ENUM),
        default: ORDER_DISCOUNT_STATUS_ENUM.UNUSED
    },
    active: {
        type: Boolean,
        default: true
    }
});
discountSchema.plugin(timestamps)
discountSchema.plugin(pagination)

const OrderDiscount = mongoose.model('OrderDiscount', discountSchema);

function validate(data) {
    const schema = {
        message: Joi.string().min(5).max(100).required(),
        reason: Joi.string().min(5).max(100).required(),
        discount_scope: Joi.string().valid(...getEnumFromObject(ORDER_DISCOUNT_SCOPE_ENUM)).required(),
        usage_count: Joi.number().min(1),
        duration_type: Joi.string().valid(...getEnumFromObject(DURATION_TYPE_ENUM)).required(),
        duration: Joi.number().min(1).required(),
        discount: Joi.number().min(0.1).max(0.8).required(),
        customer: Joi.objectId(),
        discount_type: Joi.string().valid(...getEnumFromObject(ORDER_DISCOUNT_TYPE_ENUM)).required()
    };
    return Joi.validate(data, schema);
}

/**
 * Get pending discounts
 * @returns {Promise<number>}
 */
exports.getBeneficiaryDiscounts = async (customer, products) => {
    let totalDiscount = 0;
    const generalDiscount = await OrderDiscount.findOne({
        discount_scope: ORDER_DISCOUNT_SCOPE_ENUM.GENERAL,
        active: true
    });
    if (generalDiscount)
        totalDiscount += generalDiscount.discount;


    const customerDiscount = await OrderDiscount.findOne({
        discount_scope: ORDER_DISCOUNT_SCOPE_ENUM.CUSTOMER_BASED,
        active: true
    });

    if (customerDiscount) {
        if (customerDiscount.customer.toString() === customer.toString())
            totalDiscount += customerDiscount.discount;
    }

    // const sparePartDiscounts = await OrderDiscount.find({
    //     discount_type: ORDER_DISCOUNT_SCOPE_ENUM.SPARE_PART_BASED,
    //     active: true
    // });
    // if (sparePartDiscounts.length > 0) {
    //     for (const sparePartDiscount of sparePartDiscounts) {
    //         for (const product of products) {
    //             if (product.product.toString() === sparePartDiscount.part.toString())
    //                 totalDiscount += sparePartDiscount.discount;
    //         }
    //     }
    // }


    return totalDiscount;
}


/**
 * Get direct discounts
 * @returns {Promise<number>}
 */
exports.getDirectBeneficiaryDiscounts = async (products) => {
    let totalDiscount = 0;
    const generalDiscount = await OrderDiscount.findOne({
        discount_scope: ORDER_DISCOUNT_SCOPE_ENUM.GENERAL,
        active: true
    });
    if (generalDiscount)
        totalDiscount += generalDiscount.discount;

    // const sparePartDiscounts = await OrderDiscount.find({
    //     discount_scope: ORDER_DISCOUNT_SCOPE_ENUM.SPARE_PART_BASED,
    //     active: true
    // });
    // if (sparePartDiscounts.length > 0) {
    //     for (const sparePartDiscount of sparePartDiscounts) {
    //         for (const product of products) {
    //             if (product.product.toString() === sparePartDiscount.part.toString())
    //                 totalDiscount += sparePartDiscount.discount;
    //         }
    //     }
    // }

    return totalDiscount;
}

exports.getGeneralDiscounts = async () => {
    let totalDiscount = 0;
    const generalDiscount = await OrderDiscount.findOne({
        discount_type: ORDER_DISCOUNT_SCOPE_ENUM.GENERAL,
        active: true
    });
    generalDiscount.total_usages = generalDiscount.total_usages + 1;
    generalDiscount.status = ORDER_DISCOUNT_STATUS_ENUM.ACTIVATED;

    await generalDiscount.save();

    if (generalDiscount)
        totalDiscount += generalDiscount.discount;

    return totalDiscount;
}

const getDiscountCountUsage = async (customer, discount, apply_status) => {

    const part_discounts = await AppliedDiscount.find({
        order_discount: discount,
        customer: customer,
        status: apply_status
    });

    return part_discounts.length;
}

exports.getDiscountAvailability = async (customer, discount) => {


    if (discount.status === ORDER_DISCOUNT_STATUS_ENUM.DURATION_EXPIRED)
        return "EXPIRED"
    else if (discount.status === ORDER_DISCOUNT_STATUS_ENUM.DELETED || discount.status === ORDER_DISCOUNT_STATUS_ENUM.CANCELLED)
        return "CANCELLED"
    else if (discount.discount_scope === ORDER_DISCOUNT_SCOPE_ENUM.CUSTOMER_BASED && discount.status === ORDER_DISCOUNT_STATUS_ENUM.USAGE_COUNT_EXPIRED)
        return "USAGE_COUNT_EXCEEDED"

    /// Check the usage
    let total_usages = await getDiscountCountUsage(customer._id, discount._id, APPLIED_DISCOUNT_STATUS_ENUM.ACTIVATED);

    if (discount.discount_scope === ORDER_DISCOUNT_SCOPE_ENUM.GENERAL && discount.usage_count <= total_usages)
        return "USAGE_COUNT_EXCEEDED"
    else
        return "AVAILABLE"

}

module.exports.getDiscountCountUsage = getDiscountCountUsage;
module.exports.OrderDiscount = OrderDiscount;
module.exports.validate = validate;
