const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
const {getEnumFromObject} = require("../../utils/common");
const {ORDER_STATUS_ENUM} = require("../../utils/enumerations/constants");
Joi.objectId = require('joi-objectid')(Joi);


/**
 * @swagger
 * definitions:
 *   Order:
 *     properties:
 *       _id:
 *         type: string
 *       customer:
 *         type: string
 *       delivered:
 *         type: boolean
 *       delivery_zone:
 *         type: string
 *       total_order_price:
 *         type: number
 *       status:
 *         type: string
 *         enum: ['PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'ARCHIVED']
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */

/**
 * @swagger
 * definitions:
 *   OrderDeliveryLocation:
 *     properties:
 *       delivery_zone:
 *         type: string
 *         required: true
 */

const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Customer',
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    delivery_zone: {
        type: mongoose.Schema.ObjectId,
        ref: 'DeliveryZone'
    },
    total_order_price: {
        type: Number,
    },
    total_order_tax: {
        type: Number
    },
    total_order_quantities: {
        type: Number,
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
    expiration_date: {
        type: Date,
    },
    status: {
        type: String,
        enum: getEnumFromObject(ORDER_STATUS_ENUM),
        default: ORDER_STATUS_ENUM.INITIATED
    },
    active: {
        type: Boolean,
        default: true
    }
});

orderSchema.plugin(timestamps)
orderSchema.plugin(pagination)


orderSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.day;
    delete obj.week;
    delete obj.month;
    delete obj.year;
    return obj;
}

const Order = mongoose.model('Order', orderSchema);

function validate(data) {
    const schema = {
        customer: Joi.objectId().required(),
        delivery_zone: Joi.objectId().required()
    };
    return Joi.validate(data, schema);
}


function validateDeliveryZone(data) {
    const schema = {
        delivery_zone: Joi.objectId().required()
    }
    return Joi.validate(data, schema);
}

exports.Order = Order;
exports.validate = validate;
exports.POPULATOR = {
    path: 'customer delivery_zone',
    populate: {
        path: 'user region',
        populate: {
            path: 'category country'
        }
    }
};
exports.validateDeliveryZone = validateDeliveryZone();
