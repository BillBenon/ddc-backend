const mongoose = require('mongoose');
const Joi = require('joi');
Joi.ObjectId = require('joi-objectid')(Joi)
const config = require('config');
const jwt = require('jsonwebtoken');
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2')
const {getEnumFromObject} = require("../../utils/common");
const {USER_STATUS_ENUM, SUPPLIER_TYPE_ENUM} = require("../../utils/enumerations/constants");
const {USER_GENDER_ENUM} = require("../../utils/enumerations/constants");
const {toTimestamp} = require("../../utils/common");
// const { PASSWORD } = require("../../utils/imports");
const {encodeUrl} = require("../../utils/common");
const {UserCategory} = require("./category.model");


/**
 * @swagger
 * definitions:
 *   UserLogin:
 *     properties:
 *       login:
 *         type: string
 *       password:
 *         type: string
 */

/**
 * @swagger
 * definitions:
 *   UserPasswordUpdate:
 *     properties:
 *       current_password:
 *         type: string
 *       new_password:
 *         type: string
 */

/**
 * @swagger
 * definitions:
 *   InitialPasswordReset:
 *     properties:
 *       email:
 *         type: string
 */


/**
 * @swagger
 * definitions:
 *   PasswordReset:
 *     properties:
 *       email:
 *         type: string
 *       token:
 *         type: string
 *       password:
 *         type: string
 */


/**
 * @swagger
 * definitions:
 *   User:
 *     properties:
 *       _id:
 *         type: string
 *       username:
 *         type: string
 *       email:
 *         type: string
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       phone:
 *         type: string
 *       profile:
 *         type: string
 *       category:
 *         type: string
 *       gender:
 *         type: string
 *         enum: ['MALE', 'FEMALE']
 *       password:
 *         type: string
 *         format: password
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



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: getEnumFromObject(USER_GENDER_ENUM)
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserCategory',
        required: true
    },
    password: {
        type: String,
        required: true
    },
    day: {
        type: Number,
        required: true
    },
    week: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    profile: {
        type: String
    },
    status: {
        type: String,
        default: USER_STATUS_ENUM.ACTIVE,
        enum: getEnumFromObject(USER_STATUS_ENUM)
    }
});

userSchema.plugin(timestamps);
userSchema.plugin(pagination);
userSchema.virtual('imageUrl').get(function () {
    return process.env.FILE_SERVER_URL + "/" + encodeUrl(this.profile);
});
userSchema.set('toJSON', {virtuals: true});

const passwordRegex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!@#$%^&*?><}{_)(])[a-zA-Z0-9!@#$%^&*?><}{_)(]{6,15}$")

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email,
            phone: this.phone,
            fullNames: this.firstName + " " + this.lastName,
            gender: this.gender,
            profile: this.profile,
            imageUrl: this.imageUrl,
            category: this.category,
            exp: toTimestamp(),
        }, config.get('KEY')
    )
};


exports.validateUser = (user) => {
    const schema = {
        username: Joi.string().min(5).max(50).required(),
        email: Joi.string().email(),
        phone: Joi.string().min(9).max(13),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        password: Joi.string().min(5).regex(passwordRegex).required(),
        gender: Joi.string().valid(...getEnumFromObject(USER_GENDER_ENUM)),
        category: Joi.ObjectId().required(),
        extra: Joi.object()
    }
    return Joi.validate(user, schema)
}

exports.validateUserUpdate = (user) => {
    const schema = {
        username: Joi.string().min(5).max(50).required(),
        email: Joi.string().email(),
        phone: Joi.string().min(5).max(20),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        gender: Joi.string().valid(...getEnumFromObject(USER_GENDER_ENUM)),
        category: Joi.ObjectId().required(),
        extra: Joi.object()
    }
    return Joi.validate(user, schema)
}

exports.validateEmployee = (data) => {
    const schema = {
        employeeCategory: Joi.ObjectId().required(),
        nationalId: Joi.string().min(16).max(16),
    }
    return Joi.validate(data, schema)
}

exports.validateCustomer = (data) => {
    const schema = {
        user: Joi.ObjectId().required(),
    }
    return Joi.validate(data, schema)
}

exports.validateShipper = (data) => {
    const schema = {
        user: Joi.ObjectId().required(),
    }
    return Joi.validate(data, schema)
}

exports.validateSupplier = (user) => {
    const schema = {
        address: Joi.string()
    }
    return Joi.validate(user, schema)
}
exports.validateLogin = (data) => {
    const schema = {
        login: Joi.string().required(),
        password: Joi.string().required(),
    }
    return Joi.validate(data, schema)
}
exports.validateInitialResetPassword = (data) => {
    const schema = {
        email: Joi.string().email().required(),
    }
    return Joi.validate(data, schema)
}
exports.validateResetPassword = (data) => {
    const schema = {
        password: Joi.string().min(5).regex(passwordRegex).required(),
        email: Joi.string().email().required(),
        activationToken: Joi.string().required()
    }
    return Joi.validate(data, schema)
}
exports.validatePasswordUpdate = (data) => {
    const schema = {
        current_password: Joi.string().required(),
        new_password: Joi.string().min(5).regex(passwordRegex).required(),
    }
    return Joi.validate(data, schema)
}

const _User = mongoose.model('User', userSchema);

exports.getAllAdmins = async () => {
    let adminUserCategory = await UserCategory.findOne({name: "SYSTEM_ADMIN"})
    return _User.find({category: adminUserCategory._id});
}

exports.getAllSalesManagers = async () => {
    let salesManagerUserCategory = await UserCategory.findOne({name: "EMPLOYEE"})
    return _User.find({category: salesManagerUserCategory._id});
}

exports.getAllCustomers = async () => {
    let customersUserCategory = await UserCategory.findOne({name: "CUSTOMER"})
    return _User.find({category: customersUserCategory._id, status: USER_STATUS_ENUM.ACTIVE});
}

exports.User = _User;


