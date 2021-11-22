const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');


/**
 * @swagger
 * definitions:
 *   SuppliedProduct:
 *     properties:
 *       _id:
 *         type: string
 *       part_supply:
 *         type: string
 *       spare_part:
 *         type: string
 *       quantity:
 *         type: number
 *       current_quantity:
 *         type: number
 *
 */
const suppliedPartSchema = new mongoose.Schema({
    product_supply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductSupply',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    current_quantity: {
        type: Number,
        required: true
    },
    supply_price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    }
});
suppliedPartSchema.plugin(timestamps);
suppliedPartSchema.plugin(pagination);

const SuppliedProduct = mongoose.model("SuppliedProduct", suppliedPartSchema);

function validate(data) {
    const schema = {
        part_supply: Joi.objectId().required(),
        product: Joi.objectId().required(),
        quantity: Joi.number().required(),
        supply_price: Joi.number().min(0).required()
    };
    return Joi.validate(data, schema);
}


module.exports.SUPPLIED_PRODUCTS_POPULATOR = {
    path: 'product_supply product',
    populate: {
        path: 'supplier reciever product_category',
        populate: {
            path: 'user'
        }
    }
}

module.exports.SuppliedProduct = SuppliedProduct;
module.exports.validate = validate;
