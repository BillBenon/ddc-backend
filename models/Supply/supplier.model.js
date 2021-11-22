const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const timestamps = require("mongoose-timestamp");
const pagination = require('mongoose-paginate-v2');
const {getEnumFromObject} = require("../../utils/common");
const {SUPPLIER_STATUS_ENUM, SUPPLIER_TYPE_ENUM} = require("../../utils/enumerations/constants");

/**
 * @swagger
 * definitions:
 *   Supplier:
 *     properties:
 *       _id:
 *         type: string
 *       user:
 *         type: string
 *       address:
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

const supplierSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: SUPPLIER_STATUS_ENUM.ACTIVE,
        enum: getEnumFromObject(SUPPLIER_STATUS_ENUM)
    },
});
supplierSchema.plugin(timestamps);
supplierSchema.plugin(pagination);

exports.Supplier = mongoose.model('Supplier', supplierSchema);
