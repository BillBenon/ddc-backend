const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');


/**
 * @swagger
 * definitions:
 *   TestModel:
 *     properties:
 *       _id:
 *         type: string
 *       name:
 *         type: string
 *         required: true
 *       status:
 *         type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */
const testSchema = new mongoose.Schema({
    name: {
        type: String
    },
    status: {
        type: String,
        default: 'SAVE'
    },
    active: {
        type: Boolean,
        default: true
    }
});
testSchema.plugin(timestamps);
testSchema.plugin(pagination);

const TestModel = mongoose.model("TestModel", testSchema);


module.exports.TestModel = TestModel;

