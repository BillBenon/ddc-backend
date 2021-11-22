const express = require('express');
const {
    PAYMENT_SOURCE_ENUM,
    APPLIED_DISCOUNT_STATUS_ENUM,
    ORDER_DISCOUNT_SCOPE_ENUM,
    ORDER_DISCOUNT_STATUS_ENUM
} = require("../../../utils/enumerations/constants");
const {PAYMENT_METHODS_ENUM} = require("../../../utils/enumerations/constants");
const {PURCHASE_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {genTimestamps, getDuration} = require("../../../utils/common");
const {PAYMENT_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {USER_CATEGORY_ENUM} = require("../../../utils/enumerations/constants");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {ProductOrder} = require("../../../models/Order/product-order.model");
const {ORDER_STATUS_ENUM} = require("../../../utils/enumerations/constants");

const {API_RESPONSE} = require("../../../utils/common");
const {getTotalAmount} = require("../../../utils/common");
const {OnlinePayment, validate} = require("../../../models/Payment/online-payment.model");
const router = express.Router();
const {validObjectId, dependencyChecker} = require('../../../utils/common');
const {Order} = require('../../../models/Order/order.model')
const {ProductOnMarket} = require("../../../models/Market/product-on-market.model");
const {Product} = require("../../../models/Product/product.model");
const {initiateMomoTransaction} = require('../../../utils/momo-api/requests');
const {AppliedDiscount} = require("../../../models/Discount/applied-discount.model");
const {OrderDiscount, getDiscountCountUsage} = require("../../../models/Discount/order-discount.model");
const {app} = require("../../../config/express.config");


const POPULATOR = {
    path: 'order direct_purchase discount part customer ',
    populate: {
        path: 'customer delivery_zone discount products.product customer created_by user part_in_stock',
        populate: {
            path: 'user region customer spare_part part_in_stock user category supplies.supplied_part sub_category model',
        }
    }
}


/**
 * @swagger
 * /api/v1/payments/mtn-momo:
 *   get:
 *     tags:
 *       - Payments
 *     description: Returns an array of Payments
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE, USER_CATEGORY_ENUM.CUSTOMER])], async (req, res) => {
    try {
        const payments = await OnlinePayment.find().sort({updatedAt: -1}).populate(POPULATOR);
        return res.status(200).send(payments);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/payments/mtn-momo/paginated:
 *   get:
 *     tags:
 *       - Payments
 *     description: Returns an array of Payments
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/paginated', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE, USER_CATEGORY_ENUM.CUSTOMER])], async (req, res) => {
    try {
        const {limit, page} = req.query;
        const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: (page) || 1}

        const payments = await OnlinePayment.paginate({active: true}, options);
        return res.status(200).send(payments);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/payments/mtn-momo/active:
 *   get:
 *     tags:
 *       - Payments
 *     description: Returns an array of active MTNMOMOPayments
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/active', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        const {limit, page} = req.query;
        const options = {limit: limit || 30, populate: POPULATOR, page: (page) || 1}

        const payments = await OnlinePayment.paginate({active: true}, options);
        return res.status(200).send(payments);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/payments/mtn-momo/order/{id}:
 *   get:
 *     tags:
 *       - Payments
 *     description: Returns a single payment
 *     parameters:
 *       - name: id
 *         description: payment's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/order/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE, USER_CATEGORY_ENUM.CUSTOMER, USER_CATEGORY_ENUM.SHIPPER])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const order = await Order.findOne({_id: req.params.id, active: true}).populate('delivery_zone')
        if (!order) return res.status(404).send(API_RESPONSE(false, 'order not found', null, 400));


        const payment = await OnlinePayment.find({order: req.params.id}).populate(POPULATOR);
        if (!payment) return res.status(404).send(API_RESPONSE(false, 'payment not found', null, 400));
        return res.status(200).send(payment);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/payments/mtn-momo/order/{id}/details:
 *   get:
 *     tags:
 *       - Payments
 *     description: Returns a single payment
 *     parameters:
 *       - name: id
 *         description: payment's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/order/:id/details', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE, USER_CATEGORY_ENUM.CUSTOMER, USER_CATEGORY_ENUM.SHIPPER])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const order = await Order.findOne({_id: req.params.id, active: true}).populate('delivery_zone')
        if (!order) return res.status(404).send(API_RESPONSE(false, 'order not found', null, 400));


        const payment = await OnlinePayment.find({order: req.params.id}).populate(POPULATOR);
        if (!payment) return res.status(404).send(API_RESPONSE(false, 'payment not found', null, 400));
        return res.status(200).send(payment);


    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/payments/mtn-momo/{id}:
 *   get:
 *     tags:
 *       - Payments
 *     description: Returns a single payment
 *     parameters:
 *       - name: id
 *         description: payment's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE, USER_CATEGORY_ENUM.CUSTOMER, USER_CATEGORY_ENUM.SHIPPER])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const payment = await OnlinePayment.findById(req.params.id).populate(POPULATOR);
        if (!payment) return res.status(404).send(API_RESPONSE(false, 'payment not found', null, 400));
        return res.status(200).send(payment);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/payments/mtn-momo/callback-url:
 *   post:
 *     tags:
 *       - Payments
 *     description: Callback url from mtn-momo.
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.post('/callback-url', async (req, res) => {
    try {
        res.send(API_RESPONSE(true, "Working", req.body, 200))
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/payments/mtn-momo:
 *   post:
 *     tags:
 *       - Payments
 *     description: Creates a new payment
 *     parameters:
 *       - name: body
 *         description: Fields for a payment
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/MTNMomoPayment'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.post('/', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], async (req, res) => {
    try {
        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        if (!(req.body.msisdn.startsWith('25078')) && !(req.body.msisdn.startsWith('25079')))
            return res.status(404).send(API_RESPONSE(false, 'Invalid phone number provided should start with 25078 || 25079', null, 400));


        let order, direct_purchase;

        let found_discounts = [];
        let real_total_discount = 0

        order = await Order.findOne({
            _id: req.body.order,
            status: {$in: [ORDER_STATUS_ENUM.PAYING]}
        }).populate('delivery_zone');


        const productOrders = await ProductOrder.findOne({order: order._id, active: true});
        if (!productOrders) return res.status(404).send(API_RESPONSE(false, 'Products Not found', null, 400));


        let order_prices = order.total_order_price;

        const appliedDiscounts = await AppliedDiscount.find({
            order: req.body.order,
            status: APPLIED_DISCOUNT_STATUS_ENUM.UNUSED
        });


        if (appliedDiscounts) {

            let total_discounts = 0;

            for (let applied_discount of appliedDiscounts) {
                let updated_applied_discount = await AppliedDiscount.findById(applied_discount._id);
                let order_discount = await OrderDiscount.findById(applied_discount.order_discount);

                if (getDuration(order_discount.createdAt, order_discount.duration_type) > order_discount.duration) {
                    updated_applied_discount.status = APPLIED_DISCOUNT_STATUS_ENUM.DURATION_EXPIRED;
                    updated_applied_discount.active = false;

                    order_discount.status = ORDER_DISCOUNT_STATUS_ENUM.DURATION_EXPIRED;
                    order_discount.active = false;

                    await updated_applied_discount.save();
                    await order_discount.save();
                } else {
                    total_discounts += order_discount.discount;
                    found_discounts.push(updated_applied_discount._id);
                }
            }

            if (total_discounts > 0) {
                real_total_discount = order_prices * total_discounts;
            }
        }


        const location_delivery_price = order.delivery_zone.delivery_price;
        let totalShipping = 0;

        for (const product of productOrders.products) {
            let productOnMarkert = await ProductOnMarket.findById(product.product).populate("part_in_stock")
            let product = await Product.findById(productOnMarkert.product)

            let items, weight;
            items = product.quantity
            weight = product.weight || 1

            totalShipping += items * weight * location_delivery_price;
        }

        const amountPaid = getTotalAmount(totalShipping, order_prices, real_total_discount);


        if ((parseFloat(req.body.amountPaid) !== amountPaid) || (parseFloat(req.body.shipping_amount) !== totalShipping))
            return res.status(400).send(API_RESPONSE(false, 'Invalid amounts', null, 400));

        req.body.source = PAYMENT_SOURCE_ENUM.ONLINE_PURCHASE;

        req.body.status = PAYMENT_STATUS_ENUM.INITIATED;

        req.body.discount_amount = real_total_discount;

        [req.body.day, req.body.week, req.body.month, req.body.year] = genTimestamps();

        const payment = new OnlinePayment(req.body);
        const saved = await initiateMomoTransaction(payment, found_discounts);
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'Error occurred while saving payment', null, 400));

        return res.status(201).send(saved);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

//
// /**
//  * @swagger
//  * /api/v1/payments/mtn-momo/{id}:
//  *   delete:
//  *     tags:
//  *       - Payments
//  *     description: Deletes a single payment
//  *     parameters:
//  *       - name: id
//  *         description: payment's id
//  *         in: path
//  *         required: true
//  *         type: string
//  *     responses:
//  *       200:
//  *         description: Success
//  *       404:
//  *         description: Not Found
//  *       500:
//  *         description: Internal Server Error
//  */
// router.delete('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
//     try {
//         if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
//
//         const payment = await OnlinePayment.findOne({_id: req.params.id, active: true});
//         if (!payment) return res.status(404).send(API_RESPONSE(false, 'payment not found', null, 400));
//
//
//         const deleted = await OnlinePayment.findByIdAndUpdate(req.params.id, {active: false}, {new: true})
//         if (!deleted) return res.status(500).send(API_RESPONSE(false, 'payment not updated', null, 400));
//         return res.status(200).send(API_RESPONSE(true, 'payment deleted successfully', null, 200));
//
//     } catch (err) {
//         return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
//     }
// });


module.exports = router;
