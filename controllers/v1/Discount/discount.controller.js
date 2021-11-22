const express = require('express');
const {getDuration, generateOrderCode, generateCouponCode} = require("../../../utils/common");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {
    USER_CATEGORY_ENUM,
    ORDER_STATUS_ENUM,
    APPLIED_DISCOUNT_STATUS_ENUM
} = require("../../../utils/enumerations/constants");
const {CUSTOMER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {ORDER_DISCOUNT_SCOPE_ENUM} = require("../../../utils/enumerations/constants");
const {ORDER_DISCOUNT_STATUS_ENUM} = require("../../../utils/enumerations/constants");

const {
    OrderDiscount,
    validate,
    getDiscountCountUsage,
    getDiscountAvailability
} = require("../../../models/Discount/order-discount.model");
const {Customer} = require("../../../models/Customer/customer.model");
const {Product} = require("../../../models/Product/product.model");
const router = express.Router();
const {validObjectId, API_RESPONSE, dependencyChecker} = require('../../../utils/common');
const {User, getAllCustomers} = require("../../../models/User/user.model");
const {ProductOrder} = require("../../../models/Order/product-order.model");
const {Order} = require("../../../models/Order/order.model");
const {getAllSalesManagers, getAllAdmins} = require("../../../models/User/user.model");
const {NOTIFICATION_TYPE_ENUM} = require("../../../utils/enumerations/constants");
const {notifyMany, notify} = require("../User/notifications.controller");
const {AppliedDiscount} = require("../../../models/Discount/applied-discount.model");

const POPULATOR = {
    path: 'customer',
    populate: {
        path: 'user'
    }
}


/**
 * @swagger
 * /api/v1/discounts:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns an array of Discounts
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {
        const discounts = await OrderDiscount.find().sort({updatedAt: -1}).populate(POPULATOR);
        return res.status(200).send(discounts);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/discounts/paginated:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns an array of Discounts
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/paginated', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {
        const {limit, page} = req.query;
        const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: (page) || 1}
        const discounts = await OrderDiscount.paginate({}, options);
        return res.status(200).send(discounts);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts/search:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns Discounts with a certain name
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
router.get('/search', async (req, res) => {
    try {
        const name = req.query.name;
        if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
        const regex = new RegExp(name, 'gi');

        const instances = await OrderDiscount.find({coupon_code: {$regex: regex}}).sort({updatedAt: -1}).populate(POPULATOR);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts/search/paginated:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns Paginated Discounts with a certain name
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
router.get('/search/paginated', async (req, res) => {
    try {
        const {limit, page} = req.query;
        const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: page || 1}

        const name = req.query.name;
        if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
        const regex = new RegExp(name, 'gi');

        const instances = await OrderDiscount.paginate({coupon_code: {$regex: regex}}, options);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts/type/{type}:
 *   get:
 *     tags:
 *       - Discounts
 *     parameters:
 *       - name: type
 *         description: Discount's status
 *         in: path
 *         required: true
 *         type: string
 *     description: Returns an array of Discounts
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/type/:type", async (req, res) => {
    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: page || 1}

    if (!(ORDER_DISCOUNT_SCOPE_ENUM.hasOwnProperty(req.params.type)))
        return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, {types: ORDER_DISCOUNT_SCOPE_ENUM}))

    try {
        const discounts = await OrderDiscount.paginate({discount_type: req.params.type, active: true}, options);
        return res.status(200).send(discounts);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/discounts/apply/general-discount:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns an array of Discounts
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/apply/general-discount", async (req, res) => {
    try {
        const discount = await OrderDiscount.findOne({discount_type: ORDER_DISCOUNT_SCOPE_ENUM.GENERAL, active: true});

        const duration = getDuration(discount.createdAt, discount.duration_type);
        if (duration > discount.duration) {
            discount.status = ORDER_DISCOUNT_STATUS_ENUM.DURATION_EXPIRED;
            await discount.save();
            return res.status(200).send(API_RESPONSE(false, 'Discount has reached its maximum usage count', null, 400));
        }

        if (discount.total_usages > discount.usage_count) {
            discount.status = ORDER_DISCOUNT_STATUS_ENUM.USAGE_COUNT_EXPIRED;
            await discount.save();
            return res.status(200).send(API_RESPONSE(false, 'Discount has reached its maximum usage count', null, 400));
        }

        discount.total_usages = discount.total_usages + 1;
        discount.status = ORDER_DISCOUNT_STATUS_ENUM.ACTIVATED;
        const updated = await discount.save();

        return res.status(200).send(updated)
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts/active:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns an array of Discounts
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/active", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {
        const {limit, page} = req.query;
        const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: (page - 1) || 1}

        const discounts = await OrderDiscount.paginate({active: true}, options);
        return res.status(200).send(discounts);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts/{id}:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns a single Discount
 *     parameters:
 *       - name: id
 *         description: Discount's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const discount = await OrderDiscount.findById(req.params.id).populate(POPULATOR);
        if (!discount) return res.status(404).send(API_RESPONSE(false, 'Discount not found', null, 400));
        return res.status(200).send(discount);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/discounts/customer/{id}:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns an array Discounts of a Customer
 *     parameters:
 *       - name: id
 *         description: Customer's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/customer/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const customer = await Customer.findOne({_id: req.params.id, status: CUSTOMER_STATUS_ENUM.ACTIVE});
        if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 400));

        const discounts = await OrderDiscount.find({customer: req.params.id}).sort({updatedAt: -1}).populate(POPULATOR);
        return res.status(200).send(discounts);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts/spare-part/{id}:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns an array Discounts of a Spare Part
 *     parameters:
 *       - name: id
 *         description: Product's ide
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/spare-part/:id', async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const part = await Product.findById(req.params.id);
        if (!part) return res.status(404).send(API_RESPONSE(false, 'Product not found', null, 400));

        const discounts = await OrderDiscount.find({part: req.params.id}).sort({updatedAt: -1}).populate(POPULATOR);
        return res.status(200).send(discounts);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts/status/{status}:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns an array Discounts of a status
 *     parameters:
 *       - name: status
 *         description: Discount's status
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/status/:status', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {

        if (!(ORDER_DISCOUNT_STATUS_ENUM.hasOwnProperty(req.params.status)))
            return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 400, {types: ORDER_DISCOUNT_STATUS_ENUM}))

        const discounts = await OrderDiscount.find({status: req.params.status}).sort({updatedAt: -1}).populate(POPULATOR);
        return res.status(200).send(discounts);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts/coupon-code/{code}:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns an array Discounts of a status
 *     parameters:
 *       - name: status
 *         description: Discount's status
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/coupon-code/:code', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.CUSTOMER])], async (req, res) => {
    try {
        const discount = await OrderDiscount.findOne({coupon_code: req.params.code}).populate(POPULATOR);
        if (!discount) return res.status(404).send(API_RESPONSE(false, "Coupon code does not exist", null, 404));

        return res.status(200).send(discount);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/discounts/coupon-code/{code}/details:
 *   get:
 *     tags:
 *       - Discounts
 *     description: Returns an array Discounts of a status
 *     parameters:
 *       - name: status
 *         description: Discount's status
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/coupon-code/:code/details', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.CUSTOMER])], async (req, res) => {
    try {
        const discount = await OrderDiscount.findOne({coupon_code: req.params.code});
        if (!discount) return res.status(404).send(API_RESPONSE(false, "Coupon code does not exist", null, 404));


        const customer = await Customer.findOne({user: req.AUTH_DATA.USER_ID, status: CUSTOMER_STATUS_ENUM.ACTIVE});
        if (!customer) return res.status(404).send(API_RESPONSE(false, "Requesting customer does not exist ", null, 404));

        const discount_customer = discount.customer;
        const real_customer = customer._id;

        if (discount.discount_scope === ORDER_DISCOUNT_SCOPE_ENUM.CUSTOMER_BASED)
            if (discount_customer.toString() !== real_customer.toString()) return res.status(400).send(API_RESPONSE(false, 'Sorry Coupon code not found for you. ', null, 400));

        return res.status(200).send({status: await getDiscountAvailability(customer, discount), object: discount});
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts:
 *   post:
 *     tags:
 *       - Discounts
 *     description: Creates a new Order
 *     parameters:
 *       - name: body
 *         description: Fields for a Discount
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Discount'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.post('/', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {
        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        if (req.body.discount_scope === ORDER_DISCOUNT_SCOPE_ENUM.GENERAL) {
            const existing = await OrderDiscount.findOne({
                discount_scope: ORDER_DISCOUNT_SCOPE_ENUM.GENERAL,
                status: ORDER_DISCOUNT_STATUS_ENUM.UNUSED
            });
            if (existing)
                return res.status(400).send(API_RESPONSE(false, 'General Discount already exists', null, 400));

            if (req.body.customer) return res.status(400).send(API_RESPONSE(false, 'Customer is not applicable', null, 400));
        }

        if (req.body.discount_scope === ORDER_DISCOUNT_SCOPE_ENUM.CUSTOMER_BASED) {
            if (!req.body.customer) return res.status(400).send(API_RESPONSE(false, 'Customer is required', null, 400));
        }

        let customer;
        if (req.body.customer) {
            customer = await Customer.findById(req.body.customer);
            if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 400));
        }

        let code = null, existing = null;

        while (true) {
            code = generateCouponCode();
            existing = await OrderDiscount.findOne({coupon_code: code});
            if (!existing)
                break;
        }

        req.body.coupon_code = code;

        const discount = new OrderDiscount(req.body);
        const saved = await discount.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'Discount not saved', null, 400));

        const message = " 🎉🎉🎉 Hey a new promotional order discount  for you now available. Get " + saved.discount * 100 + "% off on every order you make. COUPON-CODE : " + saved.coupon_code + " , this promotion will expire in " + discount.duration + " " + discount.duration_type + ".";

        if (saved.discount_scope === ORDER_DISCOUNT_SCOPE_ENUM.GENERAL) {
            await notifyMany(await getAllCustomers(), saved._id, NOTIFICATION_TYPE_ENUM.NEW_DISCOUNT_INITIATED, message)
        } else {
            await notify(customer.user, saved._id, NOTIFICATION_TYPE_ENUM.NEW_DISCOUNT_INITIATED, message);
        }

        return res.status(201).send(saved);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts/{id}:
 *   put:
 *     tags:
 *       - Discounts
 *     description: Updates a Discount
 *     parameters:
 *       - name: body
 *         description: Fields for a Discount
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Discount'
 *       - name: id
 *         in: path
 *         type: string
 *         description: Discount's Id
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Already Exists
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        const {error} = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        if (req.body.discount_scope === ORDER_DISCOUNT_SCOPE_ENUM.CUSTOMER_BASED) {
            if (!req.body.customer) return res.status(400).send(API_RESPONSE(false, 'Customer is required', null, 400));
        }

        let customer;
        if (req.body.customer) {
            customer = await Customer.findById(req.body.customer);
            if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 400));
        }


        const discount = new OrderDiscount(req.body);
        const saved = await discount.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'Discount not saved', null, 400));

        const message = " 🎉🎉🎉 Hey a new promotional order discount  for you now available. Get " + saved.discount * 100 + "% off on every order you make. COUPON-CODE : " + saved.coupon_code + " , this promotion will expire in " + discount.duration + " " + discount.duration_type + ".";

        if (saved.discount_scope === ORDER_DISCOUNT_SCOPE_ENUM.GENERAL) {
            await notifyMany(await getAllCustomers(), saved._id, NOTIFICATION_TYPE_ENUM.NEW_DISCOUNT_INITIATED, message)
        } else {
            await notify(customer.user, saved._id, NOTIFICATION_TYPE_ENUM.NEW_DISCOUNT_INITIATED, message);
        }

        return res.status(201).send(saved);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/discounts/{id}:
 *   delete:
 *     tags:
 *       - Discounts
 *     description: Deletes a single Discount
 *     parameters:
 *       - name: id
 *         description: Discount's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Discount not updated', null, 500));

        const discount = await OrderDiscount.findOne({_id: req.params.id, active: true});
        if (!discount) return res.status(404).send(API_RESPONSE(false, 'Order not found', null, 500));


        const deleted = await OrderDiscount.findByIdAndUpdate(req.params.id, {
            status: ORDER_DISCOUNT_STATUS_ENUM.CANCELLED,
            active: false
        }, {new: true});

        if (!deleted) return res.status(500).send(API_RESPONSE(false, 'Discount not updated', null, 500));

        const applied_discounts = await AppliedDiscount.find({order_discount: req.params.id});
        for (let applied_discount of applied_discounts) {
            await AppliedDiscount.findByIdAndUpdate(applied_discount._id, {
                status: ORDER_DISCOUNT_STATUS_ENUM.DELETED,
                active: false
            }, {new: true});
        }

        return res.status(200).send(API_RESPONSE(true, 'Discount deleted successfully', null, 200));

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


module.exports = router;
