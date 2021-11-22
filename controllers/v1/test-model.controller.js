const express = require('express');
const {API_RESPONSE} = require("../../utils/common");

const { TestModel, validate } = require("../../models/TestModel");
const router = express.Router();


/**
 * @swagger
 * /api/v1/test-models:
 *   get:
 *     tags:
 *       - TestModels
 *     description: Returns an array of AppUpdates
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
        const updates = await TestModel.find().sort( { updatedAt: -1 }) ;


        return res.status(200).send(updates);
    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});





/**
 * @swagger
 * /api/v1/test-models:
 *   post:
 *     tags:
 *       - TestModels
 *     description: Creates a new AppUpdate
 *     parameters:
 *       - name: body
 *         description: Fields for a AppUpdate
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/TestModel'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
// router.post('/',  [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])],async (req, res) => {
router.post('/',  async (req, res) => {
    try {
        const instance = new TestModel(req.body);

        const saved = await instance.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'AppUpdate not saved', null, 500));
        return res.status(201).send(saved);

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));;
    }
});







module.exports = router;
