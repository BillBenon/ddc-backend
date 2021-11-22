const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
const {DIGIT_PATTERN} = require("../../utils/enumerations/constants");
const {getEnumFromObject} = require("../../utils/common");
const {PAYMENT_METHODS_ENUM} = require("../../utils/enumerations/constants");
const {PURCHASE_STATUS_ENUM} = require("../../utils/enumerations/constants");
Joi.objectId = require('joi-objectid')(Joi);


/**
 * @swagger
 * definitions:
 *   DirectPurchaseFromMarket:
 *     properties:
 *       _id:
 *         type: string
 *       products:
 *         type: array
 *         items:
 *           properties:
 *             product:
 *               type: string
 *             quantity:
 *               type: number
 *             discounted_price:
 *               type: number
 *             total_price:
 *               type: number
 *       total_products_price:
 *         type: number
 *       total_product_quantities:
 *         type: number
 *       discount:
 *         type: string
 *       discount_amount:
 *         type: number
 *       amountToPay:
 *         type: number
 *       customer:
 *         type: string
 *       customer_names:
 *         type: string
 *       payment_method:
 *         type: string
 *         enum: ['CardPayment', 'MTNMomoPayment', 'DirectCashPayment']
 *       is_debt:
 *          type: boolean
 *       status:
 *         type: string
 *         enum: ['PENDING', 'NOT_PAID', 'DEBT', 'PAID', 'OTHERS']
 *       created_by:
 *         type: string
 *       active:
 *         type: boolean
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */



const directPurchaseFromMarket = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer'
    },
    customer_names: {
        type: String,
        required: false
    }, customer_phone: {
        type: String,
        required: false
    },
    products: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                required: true,
                ref: 'PartOnMarket'
            },
            quantity: {
                type: Number,
                required: true
            },
            discounted_price: {
                type: Number,
                required: true,
                default: 0
            },
            total_price: {
                type: Number,
                required: true
            }
        }
    ],

    total_product_quantities: {
        type: Number,
        required: true
    },
    total_products_price: {
        type: Number,
        required: true
    },
    discount: {
        type: mongoose.Schema.ObjectId,
        ref: 'OrderDiscount',
        default: null
    },
    discount_amount: {
        type: Number,
        required: true,
        default: 0
    },
    amountToPay: {
        type: Number,
        required: true
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'Employee'
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
    payment_method: {
        type: String,
        enum: getEnumFromObject(PAYMENT_METHODS_ENUM)
    },
    status: {
        type: String,
        enum: getEnumFromObject(PURCHASE_STATUS_ENUM),
        default: PURCHASE_STATUS_ENUM.PENDING
    }
});
directPurchaseFromMarket.plugin(timestamps)
directPurchaseFromMarket.plugin(pagination)

directPurchaseFromMarket.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.day;
    delete obj.week;
    delete obj.month;
    delete obj.year;
    return obj;
}

const DirectPurchaseFromMarket = mongoose.model('DirectPurchaseFromMarket', directPurchaseFromMarket);

function validate(data) {
    const productSchema = {
        product: Joi.objectId().required(),
        quantity: Joi.number().required().min(1),
        discounted_price: Joi.number().required(),
        total_price: Joi.number().required().min(1)
    };

    const schema = {
        products: Joi.array().unique().min(1).items(productSchema).required(),
        total_product_quantities: Joi.number().min(1).required(),
        total_products_price: Joi.number().min(1).required(),
        customer: Joi.objectId(),
        customer_names: Joi.string(),
        customer_phone: Joi.string(),
        is_debt: Joi.boolean().required(),
        created_by: Joi.objectId().required(),
        amountToPay: Joi.number().min(1).required()
    };
    return Joi.validate(data, schema);
}


exports.validateMTNPayment = (data) => {
    const schema = {
        msisdn: Joi.string().regex(DIGIT_PATTERN).required()
    }
    return Joi.validate(data, schema)
}

// exports.validateCardPayment = (data) => {
//     const schema = {
//         user: Joi.ObjectId().required(),
//     }
//     return Joi.validate(data, schema)
// }


exports.DirectPurchaseFromMarket = DirectPurchaseFromMarket;
exports.validate = validate;

