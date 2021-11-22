const express = require("express")
const {API_RESPONSE} = require("../../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const {
    USER_CATEGORY_ENUM,
    ORDER_STATUS_ENUM,
    NOTIFICATION_TYPE_ENUM
} = require("../../../utils/enumerations/constants");
const {Order} = require("../../../models/Order/order.model");
const {notify, notifyMany} = require("../User/notifications.controller");
const {getAllAdmins, getAllSalesManagers} = require("../../../models/User/user.model");

const router = express.Router()


/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     tags:
 *       - AfriPayPayments
 *     description: Returns an array of Payments
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {
        let payments = []
        return res.send(payments)
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})

/**
 * @swagger
 * /api/v1/payments/active:
 *   get:
 *     tags:
 *       - AfriPayPayments
 *     description: Returns an array of Payments which are active
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/paginated", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {
        let payments = []
        return res.send(payments)
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})


/**
 * @swagger
 * /api/v1/payments/callback-url:
 *   post:
 *     tags:
 *       - AfriPayPayments
 *     description: Callback url from mtn-momo
 *     parameters:
 *       - name: body
 *         description: Fields for a payment
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Payments'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.post("/callback-url", async (req, res) => {
    try {
        const POPULATOR = {
            path: 'customer',
            populate: {
                path: 'user',
            }
        }

        let order = await Order.findOne({code: req.body.client_token, active: true}).populate(POPULATOR)
        if (!order) {
            let message = "Some one payed for an order that does not exist or may be have been deleted";
            await notifyMany(await getAllAdmins(), JSON.stringify(req.body), NOTIFICATION_TYPE_ENUM.AN_ERROR_OCCURED, message)
            await notifyMany(await getAllSalesManagers(), JSON.stringify(req.body), NOTIFICATION_TYPE_ENUM.AN_ERROR_OCCURED, message)
            return res.send()
        }

        // if (order.total_order_price !== req.body.amount) {
        //     let message = "Some one payed for an order with insuficient money";
        //     await notifyMany(await getAllAdmins(), JSON.stringify({
        //         order: order._id,
        //         body: req.body
        //     }), NOTIFICATION_TYPE_ENUM.AN_ERROR_OCCURED, message)
        //     await notifyMany(await getAllSalesManagers(), JSON.stringify({
        //         order: order._id,
        //         body: req.body
        //     }), NOTIFICATION_TYPE_ENUM.AN_ERROR_OCCURED, message)
        //     return res.send()
        // }

        order.status = ORDER_STATUS_ENUM.PAID
        await order.save();

        // req.body.order = order._id
        // let payment = new Payment(req.body)
        // await payment.save()

        let message = "An order is successfully paid"

        await notify(order.customer.user, payment._id, NOTIFICATION_TYPE_ENUM.ORDER_PAYED, message)
        await notifyMany(await getAllAdmins(), payment._id, NOTIFICATION_TYPE_ENUM.ORDER_PAYED, message)
        await notifyMany(await getAllSalesManagers(), payment._id, NOTIFICATION_TYPE_ENUM.ORDER_PAYED, message)

        return res.send()
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})

module.exports = router;