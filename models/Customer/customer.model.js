const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const timestamps = require("mongoose-timestamp");
const pagination = require('mongoose-paginate-v2');
const { getEnumFromObject } = require("../../utils/common");
const { CUSTOMER_STATUS_ENUM } = require("../../utils/enumerations/constants");

/**
 * @swagger
 * definitions:
 *   Customer:
 *     properties:
 *       _id:
 *         type: string
 *       user:
 *         type: string
 *       status:
 *         type: string
 *         enum: ['ACTIVE', 'INACTIVE']
 *       createdAt:
 *         type: string
 *         format: date-time
 *       updatedAt:
 *         type: string
 *         format: date-time
 */


const customerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    status: {
        type: String,
        default: CUSTOMER_STATUS_ENUM.ACTIVE,
        enum: getEnumFromObject(CUSTOMER_STATUS_ENUM)
    }
});
customerSchema.plugin(timestamps);
customerSchema.plugin(pagination);


exports.Customer = mongoose.model("Customer", customerSchema);