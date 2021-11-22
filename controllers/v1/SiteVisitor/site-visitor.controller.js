const express = require('express');
const {getWeekRange} = require("../../../utils/common");
const {getWeekOfMonth} = require("../../../utils/common");
const {USER_CATEGORY_ENUM} = require("../../../utils/enumerations/constants");
const {API_RESPONSE} = require("../../../utils/common");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const router = express.Router();
const {validObjectId} = require("../../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {SiteVisitor, validate} = require("../../../models/SiteVisitor/site-visitor.model");



/**
 * @swagger
 * /api/v1/site-visitors:
 *   get:
 *     tags:
 *       - SiteVisitors
 *     description: Returns an array of SiteVisitors
 *     parameters:
 *       - name: limit
 *         description: Page limit
 *         in: query
 *         type: number
 *       - name: page
 *         type: number
 *         description: Page Number
 *         in: query
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
router.get('/',[AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    const { limit, page } = req.query;
    const options = { limit: limit || 30,  sort: { updatedAt: -1 } ,page: (page) || 1 };

    try {
        const visitors = await SiteVisitor.paginate({}, options);
        return res.status(200).send(visitors);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, err.toString(), null, 500));
    }
});

/**
 * @swagger
 * /api/v1/site-visitors/{id}:
 *   get:
 *     tags:
 *       - SiteVisitors
 *     description: Returns a single SiteVisitor
 *     parameters:
 *       - name: id
 *         description: Tag id
 *         in: path
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
router.get('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])],  async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const visitor = await SiteVisitor.findById(req.params.id);
        if (!visitor) return res.status(404).send(API_RESPONSE(false, 'Visitor not found', null, 404));
        return res.status(200).send(visitor);
    } catch (err) {
        return res.status(500).send(err);
    }
});

/**
 * @swagger
 * /api/v1/site-visitors:
 *   post:
 *     tags:
 *       - SiteVisitors
 *     description: Creates a new SiteVisitor
 *     parameters:
 *       - name: body
 *         description: SiteVisitor fields
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/SiteVisitor'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request | Validation Error
 *       500:
 *         description: Internal Server Error
 */
router.post('/', async (req, res) => {

    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(API_RESPONSE(false, error.details[0].message, null, 500));

        const TODAY = new Date();
        req.body.month = TODAY.getUTCMonth();
        req.body.year = TODAY.getUTCFullYear();
        req.body.day = TODAY.getUTCDate();
        const weekMappings = getWeekOfMonth(req.body.year, req.body.month);
        req.body.week = getWeekRange(weekMappings, req.body.day);

        const newVisitor = new SiteVisitor(req.body);

        const saved = await newVisitor.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'Visitor not saved', null, 500));
        return res.status(201).send(saved);

    } catch (err) {
        return res.status(500).send(err);
    }
});

module.exports = router;
