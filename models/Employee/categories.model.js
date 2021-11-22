const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
Joi.objectId = require('joi-objectid')(Joi);
const pagination = require('mongoose-paginate-v2')

/**
 * @swagger
 * definitions:
 *   EmployeeCategory:
 *     properties:
 *       _id:
 *         type: string
 *       category:
 *         type: string
 *       roles:
 *         type: array
 *         items:
 *           type: string
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

/**
 * @swagger
 * definitions:
 *   EmployeeCategoryNewRole:
 *     properties:
 *       roles:
 *         type: array
 *         items:
 *          type: string
 */
const categorySchema = mongoose.Schema({
    category: {
        type: String,
        unique: true,
        required: true
    },
    roles: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmployeeRole',
        required: true
    } ],
    description: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
})
categorySchema.plugin(timestamps);
categorySchema.plugin(pagination);

exports.Category = mongoose.model('EmployeeCategory', categorySchema);
exports.validate = (data) => {
    const schema = {
        category: Joi.string().required(),
        roles: Joi.array().unique().min(1).items(Joi.objectId().required()).required(),
        description: Joi.string().required()
    };
    return Joi.validate(data, schema);
}
exports.validateRoles = (data) => {
    const schema = {
        roles: Joi.array().unique().min(1).items(Joi.objectId().required()).required(),
    };
    return Joi.validate(data, schema);
}
