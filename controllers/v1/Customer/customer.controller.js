const express = require("express");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const {USER_CATEGORY_ENUM} = require("../../../utils/enumerations/constants");
const {User} = require("../../../models/User/user.model");
const {USER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {CUSTOMER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const { Customer } = require('../../../models/Customer/customer.model');
const router = express.Router();
const {API_RESPONSE} = require("../../../utils/common");
const {Order} = require("../../../models/Order/order.model");
const {OrderDiscount} = require("../../../models/Discount/order-discount.model");
const {CustomerReview} = require("../../../models/Customer/customer-review.model");
const { validObjectId, dependencyChecker } = require('../../../utils/common');



const populator = {
      path: 'user',
      populate: {
          path: 'category'
      }
};


/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     tags:
 *       - Customers
 *     description: Returns an array of Customers
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE, USER_CATEGORY_ENUM.SHIPPER])], async (req, res) => {
    try {
        const instances = await Customer.find().sort( { updatedAt: -1 }).populate(populator);
        return res.status(200).send(instances);
    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/customers/paginated:
 *   get:
 *     tags:
 *       - Customers
 *     description: Returns pagination of Customers
 *     parameters:
 *       - name: page
 *         description: page
 *         in: query
 *         type: string
 *       - name: limit
 *         description: limit
 *         in: query
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/paginated', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE, USER_CATEGORY_ENUM.SHIPPER])],async (req, res) => {
    try {
        const { limit, page } = req.query;
        const options = { limit: limit || 30, sort: { updatedAt: -1 }, populate: populator, page: page || 1 }

        const instances = await Customer.paginate({}, options);
        return res.status(200).send(instances);
    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});




/**
 * @swagger
 * /api/v1/customers/user/{id}:
 *   get:
 *     tags:
 *       - Customers
 *     description: Returns Customers From a user Id
 *     parameters:
 *       - name: id
 *         description: User Id 's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/user/:id", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER, USER_CATEGORY_ENUM.SHIPPER, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const user = await User.findOne({_id: req.params.id, status: USER_STATUS_ENUM.ACTIVE});
    if (!user)  return res.status(404).send(API_RESPONSE(false, 'User not found', null, 500));

    try {
        const customer = await Customer.findOne({ user: user._id }).populate(populator);
        return res.status(200).send(customer);
    } catch (err) {
       return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }

});







/**
 * @swagger
 * /api/v1/customers/status/{status}:
 *   get:
 *     tags:
 *       - Customers
 *     description: Returns an array of Customers with a status
 *     parameters:
 *       - name: status
 *         description: Customer Status
 *         type: string
 *         in: path
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/status/:status", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.SHIPPER, USER_CATEGORY_ENUM.EMPLOYEE, USER_CATEGORY_ENUM.CUSTOMER])], async (req, res) => {

    if (!(CUSTOMER_STATUS_ENUM.hasOwnProperty(req.params.status)))
      return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, {types: CUSTOMER_STATUS_ENUM}))

    try {
        const customers = await Customer.find({status: req.params.status}).sort( { updatedAt: -1 }).populate(populator);
        return res.status(200).send(customers);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/customers/status/{status}/paginated:
 *   get:
 *     tags:
 *       - Customers
 *     description: Returns an array of Customers with a status
 *     parameters:
 *       - name: status
 *         description: Customer Status
 *         type: string
 *         in: path
 *       - name: page
 *         description: page
 *         in: query
 *         type: string
 *       - name: limit
 *         description: limit
 *         in: query
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/status/:status/paginated", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.SHIPPER, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    const { limit, page } = req.query;
    const options = { limit: limit || 30, populate: populator, sort: { updatedAt: -1 }, page: page || 1 }

    if (!(CUSTOMER_STATUS_ENUM.hasOwnProperty(req.params.status)))
      return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, {types: CUSTOMER_STATUS_ENUM}))

    try {
        const customers = await Customer.paginate({status: req.params.status}, options);
        return res.status(200).send(customers);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }

});


/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     tags:
 *       - Customers
 *     description: Returns a single Customer
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
router.get("/:id",  [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.SHIPPER, USER_CATEGORY_ENUM.CUSTOMER, USER_CATEGORY_ENUM.EMPLOYEE])],async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
    
        const customer = await Customer.findOne({
            _id: req.params.id,
            status: CUSTOMER_STATUS_ENUM.ACTIVE
        }).populate(populator);
        if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 404));
        return res.status(200).send(customer);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/suppliers/search:
 *   get:
 *     tags:
 *       -Customers
 *     description: ReturnsCustomers with a certain name
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
        
        const users = await User.find({ $or: [ { firstName: { $regex: regex } }, { lastName: { $regex: regex } } ] });
        const ids = users.map(user => user._id);
        
        const customers = await Customer.find({ user: { $in: ids } }).populate(populator);
        
        return res.status(200).send(customers);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/suppliers/search/paginated:
 *   get:
 *     tags:
 *       -Customers
 *     description: Returns PaginatedCustomers with a certain name
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
        const options = { limit: limit || 30, populate: populator, page: page || 1 }
        
        const name = req.query.name;
        if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
        const regex = new RegExp(name, 'gi');
        
        
        const users = await User.find({ $or: [ { firstName: { $regex: regex } }, { lastName: { $regex: regex } } ] });
        const ids = users.map(user => user._id);
        
        const customers = await Customer.paginate({ user: { $in: ids } }, options);
        
        return res.status(200).send(customers);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/customers/{id}:
 *   delete:
 *     tags:
 *       - Customers
 *     description: Deletes a single Customer
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
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id",  [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])],async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const customer = await Customer.findOne({_id: req.params.id, status: CUSTOMER_STATUS_ENUM.INACTIVE});
        if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 400));

        const customerReviewDependency = await dependencyChecker(CustomerReview, 'customer', req.params.id);
        const discountDependency = await dependencyChecker(OrderDiscount, 'customer', req.params.id);
        const orderDependency = await dependencyChecker(Order, 'customer', req.params.id);
        // if (orderDependency) return res.status(400).send(API_RESPONSE(false, 'Record cannot be deleted\nIt has dependencies', null, 400));
        //
        // if (discountDependency) return res.status(400).send(API_RESPONSE(false, 'Document cannot be deleted\nIt Has dependencies', null, 404));
        if (customerReviewDependency || discountDependency || orderDependency)
            return res.status(400).send(API_RESPONSE(false, 'Record cannot be deleted\nIt has dependencies', null, 400));

        const deleted = await Customer.findByIdAndUpdate(req.params.id, {status: CUSTOMER_STATUS_ENUM.INACTIVE}, {new: true});
        if (!deleted) return res.status(500).send(API_RESPONSE(false, 'Customer not deleted', null, 500));
        return res.status(200).send(API_RESPONSE(true, 'Customer deleted successfully', null, 200));

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


module.exports = router;
