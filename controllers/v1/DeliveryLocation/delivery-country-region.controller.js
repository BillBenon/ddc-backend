const express = require('express');
const { USER_CATEGORY_ENUM } = require("../../../utils/enumerations/constants");
const { isUserCategory } = require("../../../middlewares/authorisation/isUserCategory.middleware");
const { AUTH_MIDDLEWARE } = require("../../../middlewares/authorisation/auth.middleware");
const { DeliveryCountryRegion, validate } = require("../../../models/DeliveryLocation/delivery-regions.model");
const { DeliveryCountry } = require("../../../models/DeliveryLocation/delivery-countries.model");
const { DeliveryZone } = require("../../../models/DeliveryLocation/delivery-zones.model");
const { validObjectId, dependencyChecker, API_RESPONSE } = require('../../../utils/common');
const router = express.Router();


const POPULATOR = {
    path: 'country'
}


/**
 * @swagger
 * /api/v1/delivery-country-regions:
 *   get:
 *     tags:
 *       - DeliveryCountryRegions
 *     description: Returns an array of DeliveryCountryRegions
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
        const locations = await DeliveryCountryRegion.find().sort({ updatedAt: -1 }).populate(POPULATOR);
        return res.status(200).send(locations);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-country-regions/paginated:
 *   get:
 *     tags:
 *       - DeliveryCountryRegions
 *     description: Returns an array of DeliveryCountryRegions
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
        
        const locations = await DeliveryCountryRegion.paginate({ active: true }, options);
        return res.status(200).send(locations);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-country-regions/country/{id}:
 *   get:
 *     tags:
 *       - DeliveryCountryRegions
 *     description: Returns  DeliveryCountryRegions in a DeliveryCountry
 *     parameters:
 *       - name: id
 *         description: DeliveryCountry's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/country/:id', async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const country = await DeliveryCountry.findById(req.params.id);
        if (!country) return res.status(404).send(API_RESPONSE(false, 'DeliveryCountryRegion not found', null, 404));
        
        
        const regions = await DeliveryCountryRegion.find({ country: req.params.id }).populate(POPULATOR);
        return res.status(200).send(regions);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-country-regions/search:
 *   get:
 *     tags:
 *       - DeliveryCountryRegions
 *     description: Returns DeliveryCountryRegions with a certain name
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
        
        const instances = await DeliveryCountryRegion.find({ region: { $regex: regex } }).populate(POPULATOR);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-country-regions/search/paginated:
 *   get:
 *     tags:
 *       - DeliveryCountryRegions
 *     description: Returns Paginated DeliveryCountryRegions with a certain name
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
        
        const instances = await DeliveryCountryRegion.paginate({ region: { $regex: regex } }, options);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-country-regions/{id}:
 *   get:
 *     tags:
 *       - DeliveryCountryRegions
 *     description: Returns a single DeliveryCountryRegion
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
router.get('/:id', async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const location = await DeliveryCountryRegion.findById(req.params.id).populate(POPULATOR);
        if (!location)
            return res.status(404).send(API_RESPONSE(false, 'DeliveryCountryRegion not found', null, 404));
        return res.status(200).send(location);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-country-regions:
 *   post:
 *     tags:
 *       - DeliveryCountryRegions
 *     description: Creates a new DeliveryCountryRegion
 *     parameters:
 *       - name: body
 *         description: Fields for a DeliveryCountryRegion
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/DeliveryCountryRegion'
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
        
        const country = await DeliveryCountry.findById(req.body.country);
        if (!country) return res.status(404).send(API_RESPONSE(false, 'DeliveryCountryRegion not found'))
        
        const existing = await DeliveryCountryRegion.findOne({ region: req.body.region, country: req.body.country });
        if (existing) return res.status(400).send(API_RESPONSE(false, 'DeliveryCountryRegion exists', null, 400));
        
        const newCountry = new DeliveryCountryRegion(req.body);
        
        const saved = await newCountry.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'DeliveryCountryRegion not saved', null, 400));
        return res.status(201).send(saved);
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-country-regions/{id}:
 *   put:
 *     tags:
 *       - DeliveryCountryRegions
 *     description: Deletes a single DeliveryCountryRegion
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
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const location = await DeliveryCountryRegion.findById(req.params.id);
        if (!location) return res.status(404).send(API_RESPONSE(false, 'DeliveryCountryRegion not found', null, 400));
        
        const existing = await DeliveryCountryRegion.findOne({ region: req.body.region, country: req.body.country });
        if (existing && existing._id !== location._id) return res.status(400).send(API_RESPONSE(false, 'DeliveryCountryRegion exists', null, 400));
        
        const country = await DeliveryCountry.findById(req.body.country);
        if (!country) return res.status(404).send(API_RESPONSE(false, 'DeliveryCountryRegion not found'))
        
        const updated = await DeliveryCountryRegion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'DeliveryCountryRegion not updated', null, 400));
        return res.status(200).send(API_RESPONSE(false, 'DeliveryCountryRegion deleted successfully', null, 400));
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-country-regions/{id}:
 *   delete:
 *     tags:
 *       - DeliveryCountryRegions
 *     description: Deletes a single DeliveryCountryRegion
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
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const location = await DeliveryCountryRegion.findById(req.params.id);
        if (!location) return res.status(404).send(API_RESPONSE(false, 'DeliveryCountryRegion not found', null, 400));
        
        const deliveryZoneDependency = await dependencyChecker(DeliveryZone, 'region', req.params.id);
        if (deliveryZoneDependency) return res.status(400).send(API_RESPONSE(false, 'Record cannot be deleted\nIt has dependencies', null, 400));
        
        const deleted = await DeliveryCountryRegion.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
        if (!deleted) return res.status(500).send(API_RESPONSE(false, 'DeliveryCountryRegion not updated', null, 400));
        return res.status(200).send(API_RESPONSE(false, 'DeliveryCountryRegion deleted successfully', null, 400));
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


module.exports = router;
