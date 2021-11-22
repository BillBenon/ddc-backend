const mongoose = require('mongoose');
const Joi = require('joi');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2');
const { encodeUrl } = require("../../utils/common");
Joi.objectId = require('joi-objectid')(Joi);


/**
 * @swagger
 * definitions:
 *   AppUpdate:
 *     properties:
 *       _id:
 *         type: string
 *       title:
 *         type: string
 *       image:
 *         type: string
 *       showcase:
 *         type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */

const updateSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    showcase: {
        type: Boolean,
        default: true
    }
});
updateSchema.plugin(timestamps)
updateSchema.plugin(pagination)
updateSchema.virtual('imageUrl').get(function () {
    return process.env.FILE_SERVER_URL + "/" + encodeUrl(this.image);
});
updateSchema.set('toJSON', { virtuals: true });


const AppUpdate = mongoose.model('AppUpdate', updateSchema);

function validate(data) {
    const schema = {
        title: Joi.string().required(),
    };
    return Joi.validate(data, schema);
}

module.exports.AppUpdate = AppUpdate;
module.exports.validate = validate;
