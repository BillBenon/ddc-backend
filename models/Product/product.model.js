const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const timestamps = require("mongoose-timestamp");
const pagination = require('mongoose-paginate-v2');
const {encodeUrl, getEnumFromObject} = require("../../utils/common");
const {COMPLETE_INFO_ENUM} = require("../../utils/enumerations/constants");
/**
 * @swagger
 * definitions:
 *   Product:
 *     properties:
 *       _id:
 *         type: string
 *       name:
 *         type: string
 *       product_code:
 *         type: string
 *         required: true
 *       weight:
 *          type: number
 *          required: false
 *       second_hand:
 *          type: boolean
 *          required: true
 *          default: false
 *       description:
 *         type: string
 *         required: true
 *         default: false
 *       product_category:
 *         type: string
 *         required: true
 *         default: false
 *       photos:
 *         type: array
 *         items:
 *           type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    product_code: {
        type: String,
        required: true
    },
    complete_info_status: {
        type: String,
        default: COMPLETE_INFO_ENUM.COMPLETE,
        enum: getEnumFromObject(COMPLETE_INFO_ENUM)
    },
    description: {
        type: String
    },
    product_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: true,
    },
    weight: {
        type: Number
    },
    photos: [{
        path: String,
    }],
    second_hand: {
        type: Boolean,
        required: true,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    }
});

productSchema.plugin(timestamps);
productSchema.plugin(pagination);
productSchema.virtual('imageUrls').get(function () {
    return this.photos.map((photo) => {
        return encodeUrl(photo.path)
    })
});

productSchema.set('toJSON', {virtuals: true});


const Product = mongoose.model("Product", productSchema);

function validate(data) {


    const schema = {
        name: Joi.string().required(),
        product_code: Joi.string().required(),
        weight: Joi.number(),
        second_hand: Joi.boolean().required(),
        complete_info_status: Joi.string(),
        description: Joi.string(),
        product_category: Joi.objectId().required(),
    };
    return Joi.validate(data, schema);
}


module.exports.Product = Product;
exports.PRODUCT_POPULATOR = {
    path: 'product_category'
}

module.exports.validate = validate;

