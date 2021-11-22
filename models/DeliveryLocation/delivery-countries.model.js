const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
Joi.objectId = require('joi-objectid')(Joi);


/**
 * @swagger
 * definitions:
 *   DeliveryCountry:
 *     properties:
 *       _id:
 *         type: string
 *       country:
 *         type: string
 *       active:
 *         type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */

const deliveryCountrySchema = new mongoose.Schema({
    country: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
});
deliveryCountrySchema.plugin(timestamps)
deliveryCountrySchema.plugin(pagination)

const DeliveryCountry = mongoose.model('DeliveryCountry', deliveryCountrySchema);

function validate(data) {
    const schema = {
        country: Joi.string().required(),
    };
    return Joi.validate(data, schema);
}

module.exports.DeliveryCountry = DeliveryCountry;
module.exports.validate = validate;
