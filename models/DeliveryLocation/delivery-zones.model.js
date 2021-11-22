const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
Joi.objectId = require('joi-objectid')(Joi);


/**
 * @swagger
 * definitions:
 *   DeliveryZone:
 *     properties:
 *       _id:
 *         type: string
 *       zone:
 *         type: string
 *       delivery_price:
 *         type: number
 *       region:
 *         type: string
 *       transfer_time:
 *         type: number
 *       active:
 *         type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */

const deliveryZoneSchema = new mongoose.Schema({
    zone: {
        type: String,
        required: true
    },
    region: {
        type: mongoose.Types.ObjectId,
        ref: 'DeliveryCountryRegion',
        required: true
    },
    transfer_time: {
        type: Number,
        required: true
    },
    delivery_price: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        default: true
    }
});
deliveryZoneSchema.plugin(timestamps)
deliveryZoneSchema.plugin(pagination)

const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);

function validate(data) {
    const schema = {
        zone: Joi.string().required(),
        region: Joi.objectId().required(),
        transfer_time: Joi.number().required(),
        delivery_price: Joi.number().required(),
    };
    return Joi.validate(data, schema);
}

module.exports.DeliveryZone = DeliveryZone;
module.exports.validate = validate;
