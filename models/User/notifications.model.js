const mongoose = require("mongoose")
const Joi = require("joi")
Joi.objectId = require("joi-objectid")(Joi)
const timestamps = require('mongoose-timestamp');
const pagination = require('mongoose-paginate-v2')
const { getEnumFromObject } = require("../../utils/common");
const { NOTIFICATION_TYPE_ENUM, NOTIFICATION_STATUS_ENUM } = require("../../utils/enumerations/constants");


/**
 * @swagger
 * definitions:
 *   Notification:
 *     properties:
 *       _id:
 *         type: string
 *       User:
 *         type: string
 *       type:
 *         type: string
 *       receiver:
 *         type: string
 *       message:
 *          type: string
 *       status:
 *          type: string
 *       createdAt:
 *         type: string
 *         format: date-time
 *       updatedAt:
 *         type: string
 *         format: date-time
 */


const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: getEnumFromObject(NOTIFICATION_TYPE_ENUM),
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: getEnumFromObject(NOTIFICATION_STATUS_ENUM),
        default: NOTIFICATION_STATUS_ENUM.UNREAD
    }
})

notificationSchema.plugin(timestamps);
notificationSchema.plugin(pagination);

// notificationSchema.post("find", async (data) => {
//     let notifications = [];
//     for (const datum of data) {
//         notifications.push(datum)
//         if(datum.status === NOTIFICATION_STATUS_ENUM.UNREAD){
//             datum.status = NOTIFICATION_STATUS_ENUM.READ
//             await datum.save()
//         }
//     }
//
//     return notifications;
// })

exports.validateMarkNotificationsAsRead = (body) => {
    const idSchema = Joi.objectId().required()
    
    const requestSchema = {
        notifications: Joi.array().unique().min(1).items(idSchema).required(),
    }
    
    return Joi.validate(body, requestSchema);
}

exports.Notification = mongoose.model('Notification', notificationSchema);