const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2')


/**
 * @swagger
 * definitions:
 *   UserCategory:
 *     properties:
 *       _id:
 *         type: string
 *       name:
 *         type: string
 *       description:
 *         type: string
 *       active:
 *         type: boolean
 *       createdAt:
 *         type: string
 *         format: date-time
 *       updatedAt:
 *         type: string
 *         format: date-time
 */


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    active: {
        type: Boolean,
        default: true
    }
});

categorySchema.plugin(pagination)
categorySchema.plugin(timestamps)


exports.validateCategory = (category) => {
    const schema = {
        name: Joi.string().min(3).required(),
        description: Joi.string(),
    }
    return Joi.validate(category, schema)
}

exports.UserCategory = mongoose.model('UserCategory', categorySchema);

