const express = require('express');
const {API_RESPONSE} = require("../../../utils/common");
const {UserCategory, validateCategory} = require("../../../models/User/category.model");
const {User} = require("../../../models/User/user.model");
const {validObjectId, dependencyChecker} = require('../../../utils/common');

const {USER_CATEGORY_ENUM} = require("../../../utils/enumerations/constants");
const router = express.Router();
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");


/**
 * @swagger
 * /api/v1/user-categories:
 *   get:
 *     tags:
 *       - UserCategories
 *     description: Returns an array of Categories
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
router.get('/', async (req, res) => {
    try {
        const {limit, page} = req.query;
        const options = {limit: limit || 30, page: (page - 1) || 1}

        const categories = await UserCategory.paginate({}, options);
        return res.status(200).send(categories);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/user-categories/byName/{name}:
 *   get:
 *     tags:
 *       - UserCategories
 *     description: Returns a single ProductCategory
 *     parameters:
 *       - name: name
 *         description: ProductCategory's Name
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/byName/:name', async (req, res) => {
    try {
        const category = await UserCategory.findOne({name: req.params.name});
        if (!category) return res.status(404).send('UserCategory not found');
        return res.status(200).send(category);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/user-categories/{id}:
 *   get:
 *     tags:
 *       - UserCategories
 *     description: Returns a single ProductCategory
 *     parameters:
 *       - name: id
 *         description: ProductCategory's id
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

        const category = await UserCategory.findById(req.params.id);
        if (!category) return res.status(404).send('UserCategory not found');
        return res.status(200).send(category);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/user-categories:
 *   post:
 *     tags:
 *       - UserCategories
 *     description: Creates a new ProductCategory
 *     parameters:
 *       - name: body
 *         description: Fields for a ProductCategory
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserCategory'
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
        const {error} = validateCategory(req.body);
        if (error) return res.status(400).send(error.details[0].message);


        const existing = await UserCategory.findOne({name: req.body.name});
        if (existing) return res.status(400).send(API_RESPONSE(false, 'UserCategory exists', null, 400));

        req.body.name = req.body.name.toUpperCase();
        const category = new UserCategory(req.body);

        const saved = await category.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'ProductCategory not saved', null, 500));
        return res.status(201).send(saved);

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'An error occurred', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/user-categories/{id}:
 *   put:
 *     tags:
 *       - UserCategories
 *     description: Updates a ProductCategory
 *     parameters:
 *       - name: body
 *         description: Fields for a ProductCategory
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserCategory'
 *       - name: id
 *         in: path
 *         type: string
 *         description: ProductCategory's Id
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
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const {error} = validateCategory(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const category = await UserCategory.findById(req.params.id);
        if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found', null, 404));

        const existing = await UserCategory.findOne({name: req.body.name});
        if (existing) return res.status(400).send(API_RESPONSE(false, 'ProductCategory exists', null, 400));

        const updated = await UserCategory.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'ProductCategory not updated', null, 500));
        return res.status(200).send(updated);

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/user-categories/{id}:
 *   delete:
 *     tags:
 *       - UserCategories
 *     description: Deletes a single ProductCategory
 *     parameters:
 *       - name: id
 *         description: ProductCategory's id
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
router.delete('/:id', async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const category = await UserCategory.findById(req.params.id);
        if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found', null, 404));

        const dependency = await dependencyChecker(User, 'category', req.params.id);
        if (dependency) return res.status(200).send(API_RESPONSE(false, 'Document cannot be deleted\nIt Has dependencies', null, 404));

        const deleted = await UserCategory.findByIdAndUpdate(req.params.id, {active: false}, {new: true});
        if (!deleted) return res.status(500).send(API_RESPONSE(false, 'ProductCategory not updated', null, 500));
        return res.status(200).send(API_RESPONSE(true, 'ProductCategory deleted successfully', null, 200));

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


module.exports = router;
