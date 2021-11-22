const express = require("express")

const controller = require("../../controllers/v1/ProductCategory/product-category.controller")
const {requestHandler} = require("../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../middlewares/authorisation/isUserCategory.middleware");
const {USER_CATEGORY_ENUM} = require("../../utils/enumerations/constants");

const router = express.Router();

/**
 * @swagger
 * /api/v1/product-categories:
 *   get:
 *     tags:
 *       - ProductCategories
 *     description: Returns an array of ProductCategories
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
 * /api/v1/product-categories/paginated:
 *   get:
 *     tags:
 *       - ProductCategories
 *     description: Returns pagination of ProductCategories
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
router.get("/paginated", requestHandler(controller.get_all_paginated))


/**
 * @swagger
 * /api/v1/product-categories/search:
 *   get:
 *     tags:
 *       - ProductCategories
 *     description: Returns ProductCategories with a certain name
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
router.get("/search", requestHandler(controller.search))


/**
 * @swagger
 * /api/v1/product-categories/search/paginated:
 *   get:
 *     tags:
 *       - ProductCategories
 *     description: Returns Paginated ProductCategories with a certain name
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
router.get("/search/paginated", requestHandler(controller.search_paginated))


/**
 * @swagger
 * /api/v1/product-categories/{id}:
 *   get:
 *     tags:
 *       - ProductCategories
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
router.get('/:id', requestHandler(controller.get_by_id))

/**
 * @swagger
 * /api/v1/product-categories:
 *   post:
 *     tags:
 *       - ProductCategories
 *     description: Creates a new ProductCategory
 *     parameters:
 *       - name: body
 *         description: Fields for a ProductCategory
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ProductCategory'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.get('/', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.create))


/**
 * @swagger
 * /api/v1/product-categories/{id}:
 *   put:
 *     tags:
 *       - ProductCategories
 *     description: Updates a ProductCategory
 *     parameters:
 *       - name: body
 *         description: Fields for a ProductCategory
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ProductCategory'
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
router.put('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.update))


/**
 * @swagger
 * /api/v1/product-categories/{id}:
 *   delete:
 *     tags:
 *       - ProductCategories
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
router.delete('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.delete))

module.exports = router