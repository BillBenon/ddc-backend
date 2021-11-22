const mongoose = require("mongoose");
const Joi = require("joi");
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
/**
 * @swagger
 * definitions:
 *   EmployeeRole:
 *     properties:
 *       _id:
 *         type: string
 *       role:
 *         type: string
 *       description:
 *         type: string
 *       active:
 *         type: boolean
 *       createdAt:
 *         type: string
 *         format:  date-time
 *       updatedAt:
 *         type: string
 *         format: date-time
 */
const roleSchema = mongoose.Schema({
    role: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
})
roleSchema.plugin(timestamps);
roleSchema.plugin(pagination);


exports.Role = mongoose.model('EmployeeRole', roleSchema);
exports.validate = (data) => {
    const schema = {
        role: Joi.string().required(),
        description: Joi.string().required()
    }
    return Joi.validate(data, schema)
}
