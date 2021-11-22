const express = require('express');
const {USER_CATEGORY_ENUM} = require("../../../utils/enumerations/constants");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {DeliveryCountry, validate} = require("../../../models/DeliveryLocation/delivery-countries.model");
const {DeliveryCountryRegion} = require("../../../models/DeliveryLocation/delivery-regions.model");
const {validObjectId, dependencyChecker, API_RESPONSE} = require('../../../utils/common');
const router = express.Router();


/**
 * @swagger
 * /api/v1/delivery-countries:
 *   get:
 *     tags:
 *       - DeliveryCountries
 *     description: Returns an array of DeliveryCountries
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
        const countries = await DeliveryCountry.find().sort({updatedAt: -1});
        return res.status(200).send(countries);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-countries/paginated:
 *   get:
 *     tags:
 *       - DeliveryCountries
 *     description: Returns an array of DeliveryCountries
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
        const {limit, page} = req.query;
        const options = {limit: limit || 30, sort: {updatedAt: -1}, page: page || 1}

        const countries = await DeliveryCountry.paginate({active: true}, options);
        return res.status(200).send(countries);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-countries/search:
 *   get:
 *     tags:
 *       - DeliveryCountries
 *     description: Returns DeliveryCountries with a certain name
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

        const instances = await DeliveryCountry.find({country: {$regex: regex}}).sort({updatedAt: -1});
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-countries/search/paginated:
 *   get:
 *     tags:
 *       - DeliveryCountries
 *     description: Returns Paginated DeliveryCountries with a certain name
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
        const options = {limit: limit || 30, sort: {updatedAt: -1}, page: page || 1}

        const name = req.query.name;
        if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
        const regex = new RegExp(name, 'gi');

        const instances = await DeliveryCountry.paginate({country: {$regex: regex}}, options);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-countries/{id}:
 *   get:
 *     tags:
 *       - DeliveryCountries
 *     description: Returns a single DeliveryCountry
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
router.get('/:id', async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const country = await DeliveryCountry.findById(req.params.id);
        if (!country) return res.status(404).send(API_RESPONSE(false, 'DeliveryCountry not found', null, 404));
        return res.status(200).send(country);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-countries:
 *   post:
 *     tags:
 *       - DeliveryCountries
 *     description: Creates a new DeliveryCountry
 *     parameters:
 *       - name: body
 *         description: Fields for a DeliveryCountry
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/DeliveryCountry'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.post('/', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        const {error} = validate(req.body);
        if (error) return res.status(400).send(API_RESPONSE(false, error.details[0].message, null, 400));

        const existing = await DeliveryCountry.findOne({country: req.body.country});
        if (existing) return res.status(400).send(API_RESPONSE(false, 'DeliveryCountry exists', null, 400));

        const newCountry = new DeliveryCountry(req.body);

        const saved = await newCountry.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'DeliveryCountry not saved', null, 400));
        return res.status(201).send(saved);

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-countries/{id}:
 *   put:
 *     tags:
 *       - DeliveryCountries
 *     description: Deletes a single DeliveryCountry
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
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const location = await DeliveryCountry.findById(req.params.id);
        if (!location) return res.status(404).send(API_RESPONSE(false, 'DeliveryCountry not found', null, 400));

        const existing = await DeliveryCountry.findOne({country: req.body.country});
        if (existing && (existing._id !== location._id)) return res.status(400).send(API_RESPONSE(false, 'DeliveryCountry exists', null, 400));


        const updated = await DeliveryCountry.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'DeliveryCountry not updated', null, 400));
        return res.status(200).send(API_RESPONSE(false, 'DeliveryCountry updated successfully', null, 400));

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/delivery-countries/{id}:
 *   delete:
 *     tags:
 *       - DeliveryCountries
 *     description: Deletes a single DeliveryCountry
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
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const location = await DeliveryCountry.findById(req.params.id);
        if (!location) return res.status(404).send(API_RESPONSE(false, 'DeliveryCountry not found', null, 400));

        const deliveryCountryRegionDependency = await dependencyChecker(DeliveryCountryRegion, 'country', req.params.id);
        if (deliveryCountryRegionDependency) return res.status(400).send(API_RESPONSE(false, 'Record cannot be deleted\nIt has dependencies', null, 400));


        const deleted = await DeliveryCountry.findByIdAndUpdate(req.params.id, {active: false}, {new: true});
        if (!deleted) return res.status(500).send(API_RESPONSE(false, 'DeliveryCountry not updated', null, 400));
        return res.status(200).send(API_RESPONSE(false, 'DeliveryCountry deleted successfully', null, 400));

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


module.exports = router;
