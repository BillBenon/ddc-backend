const express = require('express');
const { USER_CATEGORY_ENUM } = require("../../../utils/enumerations/constants");
const { AUTH_MIDDLEWARE } = require("../../../middlewares/authorisation/auth.middleware");
const { isUserCategory } = require("../../../middlewares/authorisation/isUserCategory.middleware");
const { DeliveryZone, validate } = require("../../../models/DeliveryLocation/delivery-zones.model");
const { DeliveryCountryRegion } = require("../../../models/DeliveryLocation/delivery-regions.model");
const { Order } = require("../../../models/Order/order.model");
const { validObjectId, dependencyChecker, API_RESPONSE } = require('../../../utils/common');
const router = express.Router();


const POPULATOR = {
    path: 'region',
    populate: {
        path: 'country'
    }
}


/**
 * @swagger
 * /api/v1/delivery-zones:
 *   get:
 *     tags:
 *       - DeliveryZones
 *     description: Returns an array of DeliveryZones
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/', async (req, res) => {
    try {
        const zones = await DeliveryZone.find().sort({ updatedAt: -1 }).populate(POPULATOR);
        return res.status(200).send(zones);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/delivery-zones/paginated:
 *   get:
 *     tags:
 *       - DeliveryZones
 *     description: Returns an array of DeliveryZones
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
router.get('/paginated', async (req, res) => {
    try {
        const { limit, page } = req.query;
        const options = { limit: limit || 30, populate: POPULATOR, sort: { updatedAt: -1 }, page: page || 1 }
        
        const zones = await DeliveryZone.paginate({ active: true }, options);
        return res.status(200).send(zones);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-zones/search:
 *   get:
 *     tags:
 *       - DeliveryZones
 *     description: Returns DeliveryZones with a certain name
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
        
        const instances = await DeliveryZone.find({ zone: { $regex: regex } }).sort({ updatedAt: -1 }).populate(POPULATOR);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-zones/search/paginated:
 *   get:
 *     tags:
 *       - DeliveryZones
 *     description: Returns Paginated DeliveryZones with a certain name
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
        
        const instances = await DeliveryZone.paginate({ zone: { $regex: regex } }, options);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/delivery-zones/region/{id}:
 *   get:
 *     tags:
 *       - DeliveryZones
 *     description: Returns  DeliveryZones in a DeliveryCountryRegion
 *     parameters:
 *       - name: id
 *         description: DeliveryCountryRegion's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/region/:id', async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const region = await DeliveryCountryRegion.findById(req.params.id);
        if (!region) return res.status(404).send(API_RESPONSE(false, 'DeliveryZone not found', null, 404));
        
        const regions = await DeliveryZone.find({ region: req.params.id }).sort({ updatedAt: -1 }).populate(POPULATOR);
        return res.status(200).send(regions);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-zones/{id}:
 *   get:
 *     tags:
 *       - DeliveryZones
 *     description: Returns a single DeliveryZone
 *     parameters:
 *       - name: id
 *         description: DeliveryZone's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/:id', async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const location = await DeliveryZone.findById(req.params.id).populate(POPULATOR);
        if (!location) return res.status(404).send(API_RESPONSE(false, 'DeliveryZone not found', null, 404));
        return res.status(200).send(location);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-zones:
 *   post:
 *     tags:
 *       - DeliveryZones
 *     description: Creates a new DeliveryZone
 *     parameters:
 *       - name: body
 *         description: Fields for a DeliveryZone
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/DeliveryZone'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.post('/', [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        const region = await DeliveryCountryRegion.findById(req.body.region);
        if (!region) return res.status(404).send(API_RESPONSE(false, 'DeliveryCountryRegion not found'))
        
        const existing = await DeliveryZone.findOne({ zone: req.body.zone, region: req.body.region })
        if (existing) return res.send(API_RESPONSE(false, 'DeliveryZone exists', null, 400))
        
        const newLocation = new DeliveryZone(req.body);
        
        const saved = await newLocation.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'DeliveryZone not saved', null, 400));
        return res.status(201).send(saved);
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-zones/{id}:
 *   put:
 *     tags:
 *       - DeliveryZones
 *     description: Deletes a single DeliveryZone
 *     parameters:
 *       - name: id
 *         description: DeliveryZone's id
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
router.put('/:id', [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const location = await DeliveryZone.findById(req.params.id);
        if (!location) return res.status(404).send(API_RESPONSE(false, 'DeliveryZone not found', null, 400));
        
        const existing = await DeliveryZone.findOne({
            _id: { $ne: req.params.id },
            zone: req.body.zone,
            region: req.body.region
        })
        if (existing && existing._id !== location._id) return res.send(API_RESPONSE(false, 'DeliveryZone exists', null, 400))
        
        const region = await DeliveryCountryRegion.findById(req.body.region);
        if (!region) return res.status(404).send(API_RESPONSE(false, 'DeliveryCountryRegion not found'))
        
        const updated = await DeliveryZone.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'DeliveryZone not updated', null, 400));
        return res.status(200).send(API_RESPONSE(false, 'DeliveryZone updated successfully', null, 400));
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-zones/{id}:
 *   delete:
 *     tags:
 *       - DeliveryZones
 *     description: Deletes a single DeliveryZone
 *     parameters:
 *       - name: id
 *         description: DeliveryZone's id
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
router.delete('/:id', [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const location = await DeliveryZone.findById(req.params.id);
        if (!location) return res.status(404).send(API_RESPONSE(false, 'DeliveryZone not found', null, 400));
        
        const orderDependency = await dependencyChecker(Order, 'delivery_zone', req.params.id);
        if (orderDependency) return res.status(400).send(API_RESPONSE(false, 'Record cannot be deleted\nIt has dependencies', null, 400));
        
        const deleted = await DeliveryZone.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
        if (!deleted) return res.status(500).send(API_RESPONSE(false, 'DeliveryZone not updated', null, 400));
        return res.status(200).send(API_RESPONSE(false, 'DeliveryZone deleted successfully', null, 400));
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


module.exports = router;
