const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const timestamps = require("mongoose-timestamp");
const pagination = require('mongoose-paginate-v2');
const { getEnumFromObject } = require("../../utils/common");
const { EMPLOYEE_STATUS_ENUM } = require("../../utils/enumerations/constants");

/**
 * @swagger
 * definitions:
 *   Employee:
 *     properties:
 *       _id:
 *         type: string
 *       user:
 *         type: string
 *       employeeCategory:
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


const employeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    employeeCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmployeeCategory',
        required: true,
    },
    nationalId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: getEnumFromObject(EMPLOYEE_STATUS_ENUM),
        default: EMPLOYEE_STATUS_ENUM.ACTIVE
    },
});

employeeSchema.plugin(timestamps);
employeeSchema.plugin(pagination);

exports.Employee = mongoose.model("Employee", employeeSchema);

