const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
Joi.objectId = require('joi-objectid')(Joi);

/**
 * @swagger
 * definitions:
 *   ProductOrder:
 *     properties:
 *       _id:
 *         type: string
 *       order:
 *         type: string
 *       products:
 *         type: array
 *         items:
 *           properties:
 *             product:
 *               type: string
 *             quantity:
 *               type: number
 *             price:
 *               type: number
 *       total_products_price:
 *         type: number
 *       total_product_quantities:
 *         type: number
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */


/**
 * @swagger
 * definitions:
 *   PartOrderNewProduct:
 *     properties:
 *       products:
 *         type: array
 *         items:
 *           properties:
 *             product:
 *               type: string
 *             quantity:
 *               type: number
 *             price:
 *               type: number
 */


const productOrderSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductOnMarket',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        total_tax: {
            type: Number,
            required: true
        }
    }],
    total_products_price: {
        type: Number,
        required: true
    },
    total_taxes: {
        type: Number,
        required: true
    },
    total_product_quantities: {
        type: Number,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
});
productOrderSchema.plugin(timestamps)
productOrderSchema.plugin(pagination)

const ProductOrder = mongoose.model('ProductOrder', productOrderSchema);

function validate(data) {
    const productSchema = {
        product: Joi.objectId().required(),
        quantity: Joi.number().min(1).required()
    };

    const schema = {
        order: Joi.objectId().required(),
        products: Joi.array().unique((a, b) => a.product === b.product).min(1).items(productSchema).required()
    };
    return Joi.validate(data, schema);
}

function validateNewProduct(data) {
    const productSchema = {
        product: Joi.objectId().required(),
        quantity: Joi.number().min(1).required()
    };

    const schema = {
        products: Joi.array().unique((a, b) => a.product === b.product).min(1).items(productSchema).required()
    };
    return Joi.validate(data, schema);
}


exports.PRODUCT_ORDER_POPULATOR = {
    path: 'products.product order',
    populate: {
        path: 'product customer delivery_zone',
        populate: {
            path: 'product_category user region',
            populate: {
                path: 'country'
            }
        }
    }
}

module.exports.ProductOrder = ProductOrder;
module.exports.validate = validate;
module.exports.validateNewProduct = validateNewProduct;
