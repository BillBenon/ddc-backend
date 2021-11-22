const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');

/**
 * @swagger
 * definitions:
 *   SiteVisitor:
 *     properties:
 *       _id:
 *         type: string
 *       device_public_ip:
 *         type: string
 *       location:
 *         type: string
 *       os_type:
 *         type: string
 *       device_type:
 *         type: string
 *       browser_type:
 *         type: string
 *       country:
 *         type: string
 *       coordinates:
 *         type: string
 *       visited_at:
 *         type: string
 *         format: date-time
 *       createdAt:
 *         type: string
 *         format: date-time
 *       updatedAt:
 *         type: string
 *         format: date-time
 */
const siteVisitorSchema = mongoose.Schema({
    device_public_ip: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    os_type: {
        type: String,
    },
    device_type: {
        type: String,
        required: true
    },
    browser_type: {
        type: String
    },
    country: {
        type: String
    },
    coordinates: {
        type: String
    },
    day: {
        type: Number
    },
    month: {
        type: Number
    },
    week: {
        type: Number
    },
    year: {
        type: Number
    },
    active: {
        type: Boolean,
        default: true
    }
})
siteVisitorSchema.plugin(timestamps);
siteVisitorSchema.plugin(pagination);

exports.SiteVisitor = mongoose.model('SiteVisitor', siteVisitorSchema);
exports.validate = (data) => {
    const schema = {
        device_public_ip: Joi.string().required(),
        location: Joi.string().required(),
        os_type: Joi.string(),
        country: Joi.string(),
        coordinates: Joi.string(),
        device_type: Joi.string().required(),
        browser_type: Joi.string()
    }
    return Joi.validate(data, schema)
}