const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
/**
 * @swagger
 * definitions:
 *   ProductCategory:
 *     properties:
 *       _id:
 *         type: string
 *       name:
 *         type: string
 *       description:
 *         type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
});
categorySchema.plugin(timestamps)
categorySchema.plugin(pagination);

const ProductCategory = mongoose.model('ProductCategory', categorySchema);

function validate(data) {
    const schema = {
        name: Joi.string().required(),
        description: Joi.string(),
    };
    return Joi.validate(data, schema);
}

module.exports.ProductCategory = ProductCategory;
module.exports.validate = validate;
