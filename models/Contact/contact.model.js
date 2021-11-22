const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const timestamps = require("mongoose-timestamp");
const pagination = require('mongoose-paginate-v2');

/**
 * @swagger
 * definitions:
 *   Contact:
 *     properties:
 *       _id:
 *         type: string
 *       names:
 *         type: string
 *       email:
 *         type: string
 *       message:
 *         type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 */
const contactSchema = new mongoose.Schema({
    names: {
        type: String,
    },
    email: {
        type: String,
    },
    message: {
        type: String,
    },
});
contactSchema.plugin(timestamps);
contactSchema.plugin(pagination);


const Contact = mongoose.model("Contact", contactSchema);

function validate(data) {
    const schema = {
        names: Joi.string().required(),
        email: Joi.string().email().required(),
        message: Joi.string().required()
    }
    
    return Joi.validate(data, schema);
}


module.exports.Contact = Contact;
module.exports.validate = validate;
