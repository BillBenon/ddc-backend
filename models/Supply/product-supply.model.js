const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const timestamps = require("mongoose-timestamp");
const pagination = require("mongoose-paginate-v2");

/**
 * @swagger
 * definitions:
 *   ProductSupply:
 *     properties:
 *       _id:
 *         type: string
 *       supplier:
 *         type: string
 *       supply_date:
 *         type: string
 *         format: date
 *       reciever:
 *         type: string
 *       createdAt:
 *         type: string
 *         format: date-time
 *       updatedAt:
 *         type: string
 *         format: date-time
 */
const productSupplySchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true,
    },
    supply_date: {
        type: String,
        required: true,
    },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    day: {
        type: Number,
        required: true,
    },
    week: {
        type: Number,
        required: true,
    },
    month: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    supply_price: {
        type: Number,
        default: 0,
    },
    supply_quantity: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
});
productSupplySchema.plugin(timestamps);
productSupplySchema.plugin(pagination);

productSupplySchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.day;
    delete obj.week;
    delete obj.month;
    delete obj.year;
    return obj;
};

const ProductSupply = mongoose.model("ProductSupply", productSupplySchema);

function validate(data) {
    const schema = {
        supplier: Joi.objectId().required(),
        supply_date: Joi.date().required(),
        reciever: Joi.objectId().required(),
        supply_price: Joi.number().min(0),
        supply_quantity: Joi.number().min(0),
    };
    return Joi.validate(data, schema);
}

module.exports.PRODUCT_SUPPLY_POPULATOR = {
    path: 'supplier reciever',
    populate: {
        path: 'user category',
        populate: {
            path: 'category'
        }
    }
};

module.exports.ProductSupply = ProductSupply;
module.exports.validate = validate;
