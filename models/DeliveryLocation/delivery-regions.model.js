const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
Joi.objectId = require('joi-objectid')(Joi);


/**
 * @swagger
 * definitions:
 *   DeliveryCountryRegion:
 *     properties:
 *       _id:
 *         type: string
 *       region:
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

const deliveryZoneSchema = new mongoose.Schema({
    region: {
        type: String,
        required: true
    },
    country: {
        type: mongoose.Schema.ObjectId,
        ref: 'DeliveryCountry',
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    }
});
deliveryZoneSchema.plugin(timestamps)
deliveryZoneSchema.plugin(pagination)

const DeliveryCountryRegion = mongoose.model('DeliveryCountryRegion', deliveryZoneSchema);

function validate(data) {
    const schema = {
        region: Joi.string().required(),
        country: Joi.objectId().required(),
    };
    return Joi.validate(data, schema);
}

module.exports.DeliveryCountryRegion = DeliveryCountryRegion;
module.exports.validate = validate;
