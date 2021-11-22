const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
const {COMPLETE_INFO_ENUM} = require("../../utils/enumerations/constants");
const {getEnumFromObject, encodeUrl} = require("../../utils/common");

/**
 * @swagger
 * definitions:
 *   ProductOnMarket:
 *     properties:
 *       _id:
 *         type: string
 *       product:
 *         type: string
 *       unit_price:
 *         type: number
 *       quantity:
 *         type: number
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */
const productOnMarketSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        unique: true,
        required: true
    },
    supplies: [{
        supplied_product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SuppliedProduct',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
        },
        createdAt: {type: mongoose.Schema.Types.Date, default: Date.now()}
    }],
    unit_price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    day: {
        type: Number,
        required: true
    },
    complete_info_status: {
        type: String,
        default: COMPLETE_INFO_ENUM.COMPLETE,
        enum: getEnumFromObject(COMPLETE_INFO_ENUM)
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
    active: {
        type: Boolean,
        default: true
    },
    showcase: {
        type: Boolean,
        default: false
    }
});
productOnMarketSchema.plugin(timestamps);
productOnMarketSchema.plugin(pagination);

const ProductOnMarket = mongoose.model('ProductOnMarket', productOnMarketSchema);

function validate(data) {
    const schema = {
        product: Joi.objectId().required(),
        unit_price: Joi.number().required(),
        quantity: Joi.number().required(),
        complete_info_status: Joi.string()
    };
    return Joi.validate(data, schema);
}


module.exports.PRODUCT_ON_MARKET_POPULATOR = {
    path: 'product',
    populate: {
        path: 'supplies.supplied_product product_category'
    }
}

module.exports.ProductOnMarket = ProductOnMarket;
module.exports.validate = validate;
