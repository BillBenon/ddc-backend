const express = require("express")

const controller = require("../../controllers/v1/Supply/product-supply.controller")
const {requestHandler} = require("../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../middlewares/authorisation/isUserCategory.middleware");
const {USER_CATEGORY_ENUM} = require("../../utils/enumerations/constants");

const router = express.Router();

/**
 * @swagger
 * /api/v1/product-supply:
 *   get:
 *     tags:
 *       - ProductSupplies
 *     description: Returns an array of product-supply
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Errorz
 */

router.get("/", requestHandler(controller.get_all));


/**
 * @swagger
 * /api/v1/products-supply/past-week:
 *   get:
 *     tags:
 *       - PartSupplies
 *     description: Returns an array of products-supply
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Errorz
 */

router.get("/past-week", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.get_all_past_week));


/**
 * @swagger
 * /api/v1/products-supply/paginated:
 *   get:
 *     tags:
 *       - PartSupplies
 *     description: Returns an array of products-supply
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Errorz
 */

router.get("/paginated", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.get_all_paginated));


/**
 * @swagger
 * /api/v1/products-supply/active:
 *   get:
 *     tags:
 *       - PartSupplies
 *     description: Returns an array of products-supply
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */


router.get("/active", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.get_all_active));


/**
 * @swagger
 * /api/v1/products-supply/search:
 *   get:
 *     tags:
 *       - PartSupplies
 *     description: Returns PartSupplies with a certain name
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
router.get('/search', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.get_all_active));


/**
 * @swagger
 * /api/v1/products-supply/search/paginated:
 *   get:
 *     tags:
 *       - PartSupplies
 *     description: Returns Paginated PartSupplies with a certain name
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
router.get('/search/paginated', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.search_paginated));


/**
 * @swagger
 * /api/v1/products-supply/statistics:
 *   get:
 *     tags:
 *       - PartSupplies
 *     description: Returns an array of products-supply
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */


router.get("/statistics", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.get_statistics));


/**
 * @swagger
 * /api/v1/products-supply/{id}:
 *   get:
 *     tags:
 *       - PartSupplies
 *     description: Returns a single PartSupply
 *     parameters:
 *       - name: id
 *         description: PartSupply's id
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
 * /api/v1/products-supply/supplier/{id}:
 *   get:
 *     tags:
 *       - PartSupplies
 *     description: Returns PartSupply by a supplier
 *     parameters:
 *       - name: id
 *         description: PartSupply's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */

router.get("/supplier/:id", requestHandler(controller.get_all_by_supplier));


/**
 * @swagger
 * /api/v1/products-supply/receiver/{id}:
 *   get:
 *     tags:
 *       - PartSupplies
 *     description: Returns  PartSupply received by an employee
 *     parameters:
 *       - name: id
 *         description: PartSupply's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */

router.get("/receiver/:id", requestHandler(controller.get_all_by_receiver));

/**
 * @swagger
 * /api/v1/products-supply:
 *   post:
 *     tags:
 *       - PartSupplies
 *     description: Create a PartSupply
 *     parameters:
 *       - name: body
 *         description: Fields for a PartSupply
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/PartSupply'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */

router.post("/", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.create))


/**
 * @swagger
 * /api/v1/products-supply/{id}:
 *   put:
 *     tags:
 *       - PartSupplies
 *     description: Updates a PartSupply
 *     parameters:
 *       - name: body
 *         description: Fields for a PartSupply
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/PartSupply'
 *       - name: id
 *         in: path
 *         type: string
 *         description: PartSupply's id
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

router.put("/:id", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.update))


/**
 * @swagger
 * /api/v1/products-supply/{id}:
 *   delete:
 *     tags:
 *       - PartSupplies
 *     description: Delete PartSupply
 *     parameters:
 *       - name: id
 *         description: PartSupply id
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

router.delete("/:id", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.delete))

module.exports = router