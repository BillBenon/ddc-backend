const express = require("express")

const controller = require("../../controllers/v1/Product/product.controller")
const {requestHandler} = require("../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../middlewares/authorisation/isUserCategory.middleware");
const {USER_CATEGORY_ENUM} = require("../../utils/enumerations/constants");
const {uploadProductPic} = require("../../middlewares/multer.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     tags:
 *       - SpareParts
 *     description: Returns all Spare products
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/", requestHandler(controller.get_all))

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     description: Deletes a single product
 *     parameters:
 *       - name: id
 *         description: product's id
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

router.delete("/:id", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.delete));




/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     tags:
 *       - SpareParts
 *     description: Returns a single spare part
 *     parameters:
 *       - name: id
 *         description: Product's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */

router.get("/:id", requestHandler(controller.get_by_id));


/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     tags:
 *       - Products
 *     description: Creates a new product
 *     parameters:
 *       - name: body
 *         description: Fields for a product
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Product'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Already exists
 *       500:
 *         description: Internal Server Error
 */

router.post("/", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.create))


/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     tags:
 *       - SpareParts
 *     description: Updates a Product
 *     parameters:
 *       - name: body
 *         description: Fields for a spare part
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Product'
 *       - name: id
 *         in: path
 *         type: string
 *         description: product's Id
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

router.put("/:id", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.update));


/**
 * @swagger
 * /api/v1/products/paginated:
 *   get:
 *     tags:
 *       - SpareParts
 *     description: Returns paginated  array of Spare products
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/paginated", requestHandler(controller.get_all_paginated))


/**
 * @swagger
 * /api/v1/products/product-code/exists/{product_code}:
 *   get:
 *     tags:
 *       - SpareParts
 *     description: Returns all Spare products
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/product-code/exists/:code", requestHandler(controller.code_exists))


/**
 * @swagger
 * /api/v1/products/active:
 *   get:
 *     tags:
 *       - SpareParts
 *     description: Returns an array of active SpareParts
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/active", requestHandler(controller.get_all_active))


/**
 * @swagger
 * /api/v1/products/search/paginated:
 *   get:
 *     tags:
 *       - SpareParts
 *     description: Returns SpareParts
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
router.get('/search/paginated', requestHandler(controller.search_paginated))


/**
 * @swagger
 * /api/v1/products/search:
 *   get:
 *     tags:
 *       - SpareParts
 *     description: Returns SpareParts
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
router.get('/search', requestHandler(controller.search))


/**
 * @swagger
 * /api/v1/products/category/{id}:
 *   get:
 *     tags:
 *       - Products
 *     description: Returns a products by  category
 *     parameters:
 *       - name: id
 *         description: ProductCategory Id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */

router.get("/category/:id", requestHandler(controller.get_all_category))


/**
 * @swagger
 * /api/v1/products/category/{id}/paginated:
 *   get:
 *     tags:
 *       - Products
 *     description: Returns a products by  category
 *     parameters:
 *       - name: id
 *         description: ProductCategory Id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */

router.get("/category/:id/paginated", requestHandler(controller.get_all_category_paginated))


/**
 * @swagger
 * /api/v1/products/{id}/details:
 *   get:
 *     tags:
 *       - Products
 *     description: Returns a single product
 *     parameters:
 *       - name: id
 *         description: Product's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */

router.get("/:id/details", requestHandler(controller.get_details))



/**
 * @swagger
 * /api/v1/products/upload-image/{id}:
 *   put:
 *     tags:
 *       - SpareParts
 *     description: Create a image for a Product
 *     consumes:
 *        - multipart/form-data
 *     parameters:
 *        - in: formData
 *          name: image
 *          type: file
 *          description: Product Image to upload.
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
router.put('/upload-image/:id', [uploadProductPic.single('image')], requestHandler())


/**
 * @swagger
 * /api/v1/products/delete-image/product/{id}/image/{imageId}:
 *   delete:
 *     tags:
 *       - SpareParts
 *     description: Delete an image for a Product
 *     consumes:
 *        - multipart/form-data
 *     parameters:
 *        - in: path
 *          name: id
 *          type: string
 *          required: true
 *        - in: path
 *          name: imageId
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
router.delete('/delete-image/product/:id/image/:imageId', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.delete_pic));


module.exports = router