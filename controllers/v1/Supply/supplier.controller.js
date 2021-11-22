const express = require("express");
const { USER_CATEGORY_ENUM } = require("../../../utils/enumerations/constants");
const { isUserCategory } = require("../../../middlewares/authorisation/isUserCategory.middleware");
const { AUTH_MIDDLEWARE } = require("../../../middlewares/authorisation/auth.middleware");
const { USER_STATUS_ENUM } = require("../../../utils/enumerations/constants");
const { User } = require("../../../models/User/user.model");
const { SUPPLIER_STATUS_ENUM } = require("../../../utils/enumerations/constants");
const { ProductSupply } = require("../../../models/Supply/product-supply.model");
const { Supplier } = require("../../../models/Supply/supplier.model");
const router = express.Router();
const { validObjectId, dependencyChecker, API_RESPONSE } = require('../../../utils/common');


const POPULATOR = {
    path: 'user',
    populate: {
        path: 'category'
    }
};


/**
 * @swagger
 * /api/v1/suppliers:
 *   get:
 *     tags:
 *       - Suppliers
 *     description: Returns an array of Suppliers
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        const { limit, page } = req.query;
        const options = { limit: limit || 30, populate: POPULATOR, sort: { updatedAt: -1 }, page: (page) || 1 }
        
        const suppliers = await Supplier.paginate({}, options);
        return res.status(200).send(suppliers);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/suppliers/user/{id}:
 *   get:
 *     tags:
 *       - Suppliers
 *     description: Returns Suppliers From a user Id
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
router.get("/user/:id", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.SUPPLIER ]) ], async (req, res) => {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));
    
    const user = await User.findOne({ _id: req.params.id, status: USER_STATUS_ENUM.ACTIVE });
    if (!user) return res.status(404).send(API_RESPONSE(false, 'User not found', null, 500));
    
    try {
        const supplier = await Supplier.findOne({ user: req.params.id }).populate(POPULATOR);
        return res.status(200).send(supplier);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
    
});

/**
 * @swagger
 * /api/v1/suppliers/status/{status}:
 *   get:
 *     tags:
 *       - Suppliers
 *     description: Returns an array of Suppliers with a status
 *     parameters:
 *       - name: status
 *         description: Supplier Status
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

router.get("/status/:status", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    const { limit, page } = req.query;
    const options = { limit: limit || 30, populate: POPULATOR, page: (page) || 1 }
    
    if (!(SUPPLIER_STATUS_ENUM.hasOwnProperty(req.params.status)))
        return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, { types: SUPPLIER_STATUS_ENUM }))
    
    try {
        const suppliers = await Supplier.paginate({ status: req.params.status }, options);
        return res.status(200).send(suppliers);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
    
});


/**
 * @swagger
 * /api/v1/suppliers/search:
 *   get:
 *     tags:
 *       - Suppliers
 *     description: Returns Suppliers with a certain name
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
        
        const suppliers = await Supplier.find({ user: { $in: ids } }).populate(POPULATOR);
        
        return res.status(200).send(suppliers);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/suppliers/search/paginated:
 *   get:
 *     tags:
 *       - Suppliers
 *     description: Returns Paginated Suppliers with a certain name
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
        const options = { limit: limit || 30, populate: POPULATOR, page: page || 1 }
        
        const name = req.query.name;
        if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
        const regex = new RegExp(name, 'gi');
        
        
        const users = await User.find({ $or: [ { firstName: { $regex: regex } }, { lastName: { $regex: regex } } ] });
        const ids = users.map(user => user._id);
        
        const suppliers = await Supplier.paginate({ user: { $in: ids } }, options);
        
        return res.status(200).send(suppliers);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/suppliers/list/status/{status}:
 *   get:
 *     tags:
 *       - Suppliers
 *     description: Returns an array of Suppliers with a status
 *     parameters:
 *       - name: status
 *         description: Supplier Status
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

router.get("/list/status/:status", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    if (!(SUPPLIER_STATUS_ENUM.hasOwnProperty(req.params.status)))
        return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, { types: SUPPLIER_STATUS_ENUM }))
    
    try {
        const suppliers = await Supplier.find({ status: req.params.status }).populate(POPULATOR);
        return res.status(200).send(suppliers);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/suppliers/{id}:
 *   get:
 *     tags:
 *       - Suppliers
 *     description: Returns a single Supplier
 *     parameters:
 *       - name: id
 *         description: Supplier's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/:id", [ AUTH_MIDDLEWARE ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid Valid ObjectId', null, 400));
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            status: SUPPLIER_STATUS_ENUM.ACTIVE
        }).populate(POPULATOR);
        if (!supplier) return res.status(404).send(API_RESPONSE(false, "Supplier not found", null, 400));
        return res.status(200).send(supplier);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/suppliers/{id}:
 *   delete:
 *     tags:
 *       - Suppliers
 *     description: Deletes a single Supplier
 *     parameters:
 *       - name: id
 *         description: Supplier's id
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
router.delete("/:id", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const supplier = await Supplier.findOne({ _id: req.params.id, status: SUPPLIER_STATUS_ENUM.ACTIVE });
        if (!supplier) return res.status(404).send(API_RESPONSE(false, "Supplier not found", null, 400));
        
        const partSupplyDependency = await dependencyChecker(ProductSupply, 'supplier', req.params.id);
        if (partSupplyDependency) return res.status(200).send(API_RESPONSE(false, 'Document cannot be deleted\nIt Has dependencies', null, 400));
        
        const deleted = await Supplier.findByIdAndUpdate(req.params.id, { status: SUPPLIER_STATUS_ENUM.INACTIVE });
        if (!deleted) return res.status(500).send(API_RESPONSE(false, "Supplier not updated", null, 400));
        return res.status(200).send(API_RESPONSE(false, "Supplier deleted successfully", null, 400));
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

module.exports = router;
