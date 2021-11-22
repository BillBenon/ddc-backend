const express = require("express");
const { CUSTOMER_STATUS_ENUM, NOTIFICATION_TYPE_ENUM } = require("../../../utils/enumerations/constants");
const { API_RESPONSE } = require("../../../utils/common");
const { CustomerReview, validate } = require('../../../models/Customer/customer-review.model');
const { Customer } = require('../../../models/Customer/customer.model');
const router = express.Router();
const { validObjectId } = require('../../../utils/common');
const { AUTH_MIDDLEWARE } = require("../../../middlewares/authorisation/auth.middleware");
const { isUserCategory } = require("../../../middlewares/authorisation/isUserCategory.middleware");
const { USER_CATEGORY_ENUM } = require("../../../utils/enumerations/constants");
const { notifyMany } = require("../User/notifications.controller");
const { getAllAdmins } = require("../../../models/User/user.model");


const POPULATOR = {
    path: 'customer',
    populate: {
        path: 'user',
        populate: {
            path: 'category'
        }
    }
};

/**
 * @swagger
 * /api/v1/customer-reviews:
 *   get:
 *     tags:
 *       - CustomerReviews
 *     description: Returns an array of CustomerReviews
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/", async (req, res) => {
    try {
        const instances = await CustomerReview.find().sort({ updatedAt: -1 }).populate(POPULATOR);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/customer-reviews/paginated:
 *   get:
 *     tags:
 *       - CustomerReviews
 *     description: Returns an array of CustomerReviews
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/paginated", async (req, res) => {
    try {
        const { limit, page } = req.query;
        const options = { limit: limit || 30, populate: POPULATOR, sort: { updatedAt: -1 }, page: page || 1 }
        
        
        const reviews = await CustomerReview.paginate({}, options);
        return res.status(200).send(reviews);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/customer-reviews/search:
 *   get:
 *     tags:
 *       - CustomerReviews
 *     description: Returns CustomerReviews with a certain name
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
        
        const instances = await CustomerReview.find({ review_paragraph: { $regex: regex } }).sort({ updatedAt: -1 }).populate(POPULATOR);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/customer-reviews/search/paginated:
 *   get:
 *     tags:
 *       - CustomerReviews
 *     description: Returns Paginated CustomerReviews with a certain name
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
        const { limit, page } = req.query;
        const options = { limit: limit || 30, populate: POPULATOR, sort: { updatedAt: -1 }, page: page || 1 }
        
        const name = req.query.name;
        if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
        const regex = new RegExp(name, 'gi');
        
        const instances = await CustomerReview.paginate({ review_paragraph: { $regex: regex } }, options);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/customer-reviews/{id}:
 *   get:
 *     tags:
 *       - CustomerReviews
 *     description: Returns a single CustomerReview
 *     parameters:
 *       - name: id
 *         description: CustomerReview's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/:id", async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const review = await CustomerReview.findById(req.params.id).populate(POPULATOR);
        if (!review) return res.status(404).send(API_RESPONSE(false, 'Reviews not found', null, 404));
        return res.status(200).send(review);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/customer-reviews:
 *   post:
 *     tags:
 *       - CustomerReviews
 *     description: Creates a new CustomerReview
 *     parameters:
 *       - name: body
 *         description: Fields for a CustomerReview
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/CustomerReview'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Already exists
 *       500:
 *         description: Internal Server Error
 */
router.post("/", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
    
        const customer = await Customer.findOne({
            _id: req.body.customer,
            status: CUSTOMER_STATUS_ENUM.ACTIVE
        }).populate("user");
        if (!customer) return res.status(400).send(API_RESPONSE(false, 'Customer not found', null, 500));
    
        const review = new CustomerReview(req.body);
    
        const saved = await review.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'An error occurred', null, 500));
    
        let theMessage = "You received a new review message from " + customer.user.firstName + " " + customer.user.lastName;
        await notifyMany(await getAllAdmins(), saved._id, NOTIFICATION_TYPE_ENUM.CUSTOMER_REVIVEW, theMessage)
    
        return res.status(201).send(saved);
    
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/customer-reviews/{id}:
 *   put:
 *     tags:
 *       - CustomerReviews
 *     description: Updates a CustomerReview
 *     parameters:
 *       - name: body
 *         description: Fields for a CustomerReview
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/CustomerReview'
 *       - name: id
 *         in: path
 *         type: string
 *         description: CustomerReview's Id
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
router.put("/:id", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        const review = await CustomerReview.findById(req.params.id);
        if (!review) return res.status(404).send(API_RESPONSE(false, 'CustomerReview not found', null, 500));
        
        const customer = await Customer.findById(req.body.customer);
        if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 404));
        
        const updated = await CustomerReview.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'CustomerReview not updated', null, 500));
        return res.status(200).send(updated);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/customer-reviews/{id}/status/toggle:
 *   put:
 *     tags:
 *       - CustomerReviews
 *     description: Toggle the customer review status
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         description: CustomerReview's Id
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id/status/toggle", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const review = await CustomerReview.findById(req.params.id);
        if (!review) return res.status(404).send(API_RESPONSE(false, 'CustomerReview not found', null, 500));
        
        review.active = !review.active;
        
        let theReview = await review.save()
        if (!theReview) return res.status(500).send(API_RESPONSE(false, "Failed to toggle the status", null, 500));
        
        return res.status(200).send(theReview);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/customer-reviews{id}:
 *   delete:
 *     tags:
 *       - CustomerReviews
 *     description: Deletes a single CustomerReview
 *     parameters:
 *       - name: id
 *         description: CustomerReview's id
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
router.delete("/:id", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const review = await CustomerReview.findById(req.params.id);
        if (!review) return res.status(404).send(API_RESPONSE(false, 'CustomerReview not found', null, 404));
        
        const deleted = await CustomerReview.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(500).send(API_RESPONSE(false, 'CustomerReview not updated', null, 500));
        return res.status(200).send(API_RESPONSE(false, 'CustomerReview deleted successfully', null, 500));
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


module.exports = router;
