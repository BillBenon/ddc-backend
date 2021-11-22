const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const timestamps = require("mongoose-timestamp");
const pagination = require('mongoose-paginate-v2');

/**
 * @swagger
 * definitions:
 *   CustomerReview:
 *     properties:
 *       _id:
 *         type: string
 *       customer:
 *         type: string
 *       review_paragraph:
 *         type: string
 *       rating:
 *         type: number
 *       active:
 *         type: boolean
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */
const reviewSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    review_paragraph: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
});
reviewSchema.plugin(timestamps);
reviewSchema.plugin(pagination);


const CustomerReview = mongoose.model("CustomerReview", reviewSchema);

function validate(data) {
    const schema = {
        customer: Joi.objectId().required(),
        rating: Joi.number(),
        review_paragraph: Joi.string().required()
    };
    return Joi.validate(data, schema);
}


module.exports.CustomerReview = CustomerReview;
module.exports.validate = validate;
