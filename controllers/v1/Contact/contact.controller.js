const express = require("express");
const { NOTIFICATION_TYPE_ENUM } = require("../../../utils/enumerations/constants");
const { API_RESPONSE } = require("../../../utils/common");
const { Contact, validate } = require('../../../models/Contact/contact.model');
const router = express.Router();
const { validObjectId } = require('../../../utils/common');
const { notifyMany } = require("../User/notifications.controller");
const { getAllAdmins } = require("../../../models/User/user.model");
// const { io } = require("../../../config/socket.config");


/**
 * @swagger
 * /api/v1/contacts:
 *   get:
 *     tags:
 *       - Contacts
 *     description: Returns an array of Contacts
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
        const instances = await Contact.find().sort({ updatedAt: -1 });
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/contacts/paginated:
 *   get:
 *     tags:
 *       - Contacts
 *     description: Returns an array of Contacts
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
        const options = { limit: limit || 30, sort: { updatedAt: -1 }, page: page || 1 }
        
        
        const instances = await Contact.paginate({}, options);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/contacts/search:
 *   get:
 *     tags:
 *       - Contacts
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
        
        const instances = await Contact.find({
            names: { $regex: regex },
            email: { $regex: regex },
            message: { $regex: regex }
        }).sort({ updatedAt: -1 });
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/contacts/search/paginated:
 *   get:
 *     tags:
 *       - Contacts
 *     description: Returns Paginated Contact with a certain name
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
        const options = { limit: limit || 30, sort: { updatedAt: -1 }, page: page || 1 }
        
        const name = req.query.name;
        if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
        const regex = new RegExp(name, 'gi');
        
        const instances = await Contact.paginate({
            names: { $regex: regex },
            email: { $regex: regex },
            message: { $regex: regex }
        }, options);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/contacts/{id}:
 *   get:
 *     tags:
 *       - Contacts
 *     description: Returns a single Contact
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
        
        const instance = await Contact.findById(req.params.id);
        if (!instance) return res.status(404).send(API_RESPONSE(false, 'Contact not found', null, 404));
        return res.status(200).send(instance);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/contacts:
 *   post:
 *     tags:
 *       - Contacts
 *     description: Creates a new CustomerReview
 *     parameters:
 *       - name: body
 *         description: Fields for a CustomerReview
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Contact'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Already exists
 *       500:
 *         description: Internal Server Error
 */
router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        const instance = new Contact(req.body);
        
        const saved = await instance.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'An error occurred', null, 500));
        
        await notifyMany(await getAllAdmins(), saved._id, NOTIFICATION_TYPE_ENUM.CONTACTED, "You received a new contact us message from " + req.body.names)
        
        return res.status(201).send(saved);
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/contacts/{id}:
 *   delete:
 *     tags:
 *       - Contacts
 *     description: Deletes a single Contact
 *     parameters:
 *       - name: id
 *         description: Contact's id
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
router.delete("/:id", async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const instance = await Contact.findById(req.params.id);
        if (!instance) return res.status(404).send(API_RESPONSE(false, 'Contact not found', null, 404));
        
        const deleted = await Contact.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(500).send(API_RESPONSE(false, 'Contact not updated', null, 500));
        return res.status(200).send(API_RESPONSE(false, 'Contact deleted successfully', null, 500));
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


module.exports = router;
