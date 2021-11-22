const express = require("express")

const {Notification, validateMarkNotificationsAsRead} = require("../../../models/User/notifications.model")
const {API_RESPONSE} = require("../../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {NOTIFICATION_STATUS_ENUM} = require("../../../utils/enumerations/constants");

const router = express.Router();

/**
 * @swagger
 * /api/v1/notifications:
 *   post:
 *     tags:
 *       - Notifications
 *     description: Get all notifications of a logged in user
 *     parameters:
 *       - name: name
 *         description: Name
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('', AUTH_MIDDLEWARE, async (req, res) => {
    try {
        let user = req.AUTH_DATA.USER_ID

        const {limit, page} = req.query;
        const options = {limit: limit || 5, sort: {updatedAt: -1}, page: page || 1}

        let notifications = await Notification.paginate({user: user}, options)
        return res.send(notifications);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})

router.get('/new', AUTH_MIDDLEWARE, async (req, res) => {
    try {
        let user = req.AUTH_DATA.USER_ID
        let beforeTenSeconds = new Date()
        beforeTenSeconds.setSeconds(beforeTenSeconds.getSeconds() - 10)
        let notifications = await Notification.find({user: user, createdAt: {$gte: beforeTenSeconds}})
        return res.send(notifications);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})

router.get('/unreads', AUTH_MIDDLEWARE, async (req, res) => {
    try {
        let user = req.AUTH_DATA.USER_ID
        let notifications = await Notification.find({
            user: user,
            status: NOTIFICATION_STATUS_ENUM.UNREAD
        }).sort({updatedAt: -1})
        return res.send(notifications);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})


router.put("/mark-many-as-read", async (req, res) => {
    try {
        let {error} = validateMarkNotificationsAsRead(req.body)
        if (error) return res.status(400).send(API_RESPONSE(false, error.details[0].message, null, 400));

        let {notifications} = req.body

        for (const notification of notifications) {
            let theNotification = await Notification.findById(notification)
            if (!theNotification)
                return res.status(400).send(API_RESPONSE(false, "Notification not found", null, 400));

            theNotification.status = NOTIFICATION_STATUS_ENUM.READ

            await theNotification.save();
        }

        return res.send(API_RESPONSE(true, "Marked notifications as read", null, 200))

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})

const _notify = async (user, link, type, message) => {
    let notification = new Notification({status: NOTIFICATION_STATUS_ENUM.UNREAD, user, link, type, message,})
    await notification.save();
}
exports.notify = _notify;

exports.notifyMany = async (users, link, type, message) => {
    for (const user of users) {
        await _notify(user, link, type, message)
    }
}

exports.notificationsController = router;