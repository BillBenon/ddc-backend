const express = require('express');
const {name} = require("../../../utils/sum");
const {encodeUrl} = require("../../../utils/common");
const {USER_CATEGORY_ENUM} = require("../../../utils/enumerations/constants");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {fileFromPathUnlink} = require("../../../utils/common");
const { uploadAppUpdate } = require('../../../middlewares/multer.middleware');
const { AppUpdate, validate } = require("../../../models/AppUpdate/app-update-model");
const { validObjectId, API_RESPONSE } = require('../../../utils/common');
const router = express.Router();


/**
 * @swagger
 * /api/v1/app-updates:
 *   get:
 *     tags:
 *       - AppUpdates
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
        const updates = await AppUpdate.find().sort( { updatedAt: -1 }) ;
        return res.status(200).send(updates);
    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/app-updates/paginated:
 *   get:
 *     tags:
 *       - AppUpdates
 *     description: Returns pagination of App Updatges
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
        const options = { limit: limit || 30, sort: { updatedAt: -1 }, page: page || 1 }

        const updates = await AppUpdate.paginate({}, options);
        return res.status(200).send(updates);
    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/app-updates/search:
 *   get:
 *     tags:
 *       - AppUpdates
 *     description: Returns AppUpdates with a certain name
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

        const instances = await AppUpdate.find({ title: { $regex: regex } }).sort( { updatedAt: -1 });
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/app-updates/search/paginated:
 *   get:
 *     tags:
 *       - AppUpdates
 *     description: Returns Paginated AppUpdates with a certain name
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

        const instances = await AppUpdate.paginate({ title: { $regex: regex } }, options);
        return res.status(200).send(instances);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/app-updates/all/showcase:
 *   get:
 *     tags:
 *       - AppUpdates
 *     description: Returns an array of AppUpdates Showcases
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
router.get('/all/showcase', async (req, res) => {
    try {
        const { limit, page } = req.query;
        const options = { limit: limit || 30, page: (page - 1) || 1 }

        const updates = await AppUpdate.paginate({ showcase: true }, {sort:  { showcase: -1, updatedAt: -1  }}, options);
        return res.status(200).send(updates);
    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/app-updates/sort/showcase:
 *   get:
 *     tags:
 *       - AppUpdates
 *     description: Returns an array of AppUpdates Showcases
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
router.get('/sort/showcase', async (req, res) => {
    try {
        const { limit, page } = req.query;
        const options = { limit: limit || 30, page: (page - 1) || 1 }

        const updates = await AppUpdate.paginate({}, {sort:  { showcase: -1, updatedAt: -1 }}, options);
        return res.status(200).send(updates);
    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});




/**
 * @swagger
 * /api/v1/app-updates/{id}:
 *   get:
 *     tags:
 *       - AppUpdates
 *     description: Returns a single AppUpdate
 *     parameters:
 *       - name: id
 *         description: AppUpdate's id
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
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', 500));

        const update = await AppUpdate.findById(req.params.id);
        if (!update) return res.status(404).send(API_RESPONSE(false, 'AppUpdate not found', null, 404));
        return res.status(200).send(update);
    }
    catch (err) {
       return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/app-updates:
 *   post:
 *     tags:
 *       - AppUpdates
 *     description: Creates a new AppUpdate
 *     parameters:
 *       - name: body
 *         description: Fields for a AppUpdate
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/AppUpdate'
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
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const existing = await AppUpdate.findOne({title: req.body.title});
        if (existing)
                return res.status(400).send(API_RESPONSE(false, 'AppUpdate already exists', null, 400));

        req.body.image = '/opt/KOREA-AUTO-RWANDA/images/app-updates';
        const appUpdate = new AppUpdate(req.body);

        const saved = await appUpdate.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'AppUpdate not saved', null, 500));
        return res.status(201).send(saved);

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});






/**
 * @swagger
 * /api/v1/app-updates/upload-image/{id}:
 *   put:
 *     tags:
 *       - AppUpdates
 *     description: Create a image for a AppUpdate
 *     consumes:
 *        - multipart/form-data
 *     parameters:
 *        - in: formData
 *          name: file
 *          type: file
 *          description: AppUpdate Image to upload.
 *        - in: path
 *          name: id
 *          type: string
 *          required: true
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request | Validation Error
 *       500:
 *         description: Internal Server Error
 */
router.put('/upload-image/:id',  uploadAppUpdate.single('file'), async (req, res) => {
// router.put('/upload-image/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE]), uploadAppUpdate.single('image')], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));


        if (!req.file) return res.status(400).send(API_RESPONSE(false, 'No File found', null, 400));

        const appUpdate = await AppUpdate.findById(req.params.id);
        if (!appUpdate) return res.status(404).send(API_RESPONSE(false, 'AppUpdate not updated', null, 500));

        const updated = await AppUpdate.findByIdAndUpdate(req.params.id, { image: req.file.path }, { new: true });
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'AppUpdate not updated', null, 500));
        return res.status(200).send(updated);

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/app-updates/{id}:
 *   put:
 *     tags:
 *       - AppUpdates
 *     description: Updates a ProductCategory
 *     parameters:
 *       - name: body
 *         description: Fields for a ProductCategory
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/AppUpdate'
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
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const existing = await AppUpdate.findOne({title: req.body.title});
        if (existing)
                return res.status(400).send(API_RESPONSE(false, 'AppUpdate already exists', null, 400));

        const update = await AppUpdate.findById(req.params.id);
        if (!update) return res.status(404).send(API_RESPONSE(false, 'An error occurred', null, 500));

        const updated = await AppUpdate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'ProductCategory not updated', null, 404));
        return res.status(200).send(updated);

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
* @swagger
* /api/v1/app-updates/showcase/{id}:
*   put:
*     tags:
*       - AppUpdates
*     description: Updates an AppUpdate
*     parameters:
*       - name: id
*         in: path
*         type: string
*         description: AppUpdate's Id
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
router.put('/showcase/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));


        const existing = await AppUpdate.findById(req.params.id);
        if (!existing) return res.status(400).send(API_RESPONSE(false, 'AppUpdate not found', null, 500));

        const updated = await AppUpdate.findByIdAndUpdate(req.params.id, { showcase: !(existing.showcase) }, { new: true });
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'AppUpdate not updated', null, 500));
        return res.status(200).send(updated);

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
* @swagger
* /api/v1/app-updates/unshowcase/{id}:
*   put:
*     tags:
*       - AppUpdates
*     description: Updates an AppUpdate
*     parameters:
*       - name: id
*         in: path
*         type: string
*         description: AppUpdate's Id
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
router.put('/unshowcase/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', err, 500));

        const existing = await AppUpdate.findById(req.params.id);
        if (!existing) return res.status(400).send(API_RESPONSE(false, 'AppUpdate not found', null, 400));

        const updated = await AppUpdate.findByIdAndUpdate(req.params.id, { showcase: false }, { new: true });
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'AppUpdate not updated', null, 500));
        return res.status(200).send(updated);

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});



/**
 * @swagger
 * /api/v1/app-updates/{id}:
 *   delete:
 *     tags:
 *       - AppUpdates
 *     description: Deletes a single AppUpdate
 *     parameters:
 *       - name: id
 *         description: AppUpdate's id
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
router.delete('/:id',  [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])],async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

        const appUpdate = await AppUpdate.findById(req.params.id);
        if (!appUpdate) return res.status(404).send(API_RESPONSE(false, 'AppUpdate not found', null, 404));

        const deleted = await AppUpdate.findByIdAndDelete(req.params.id);
        if (deleted.image !== 'public/images/app-updates/default.png')
            await fileFromPathUnlink(deleted.image);

        if (!deleted) return res.status(500).send(API_RESPONSE(false, 'AppUpdate not found', null, 500));

        return res.status(200).send(API_RESPONSE(true, 'AppUpdate deleted successfully', null, 200));

    }
    catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});




module.exports = router;
