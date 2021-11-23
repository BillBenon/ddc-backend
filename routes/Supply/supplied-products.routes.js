const express = require("express")

const controller = require("../../controllers/v1/Supply/supplied-product.controller")
const {requestHandler} = require("../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../middlewares/authorisation/isUserCategory.middleware");
const {USER_CATEGORY_ENUM} = require("../../utils/enumerations/constants");

const router = express.Router();

/**
 * @swagger
 * /api/v1/supplied-products:
 *   get:
 *     tags:
 *       - SuppliedProducts
 *     description: Returns an array of SuppliedParts
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
 * /api/v1/supplied-products/{id}:
 *   get:
 *     tags:
 *       - SuppliedParts
 *     description: Returns a single SuppliedPart
 *     parameters:
 *       - name: id
 *         description: SuppliedPart's id
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
 * /api/v1/supplied-products:
 *   post:
 *     tags:
 *       - SuppliedParts
 *     description: Create a SuppliedPart
 *     parameters:
 *       - name: body
 *         description: Fields for a SuppliedPart
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/SuppliedPart'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.post("/",  requestHandler(controller.create));


/**
 * @swagger
 * /api/v1/supplied-products/{id}:
 *   delete:
 *     tags:
 *       - SuppliedParts
 *     description: Delete SuppliedPart
 *     parameters:
 *       - name: id
 *         description: SuppliedPart id
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
router.delete("/:id",  requestHandler(controller.delete))

/**
 * @swagger
 * /api/v1/supplied-products/paginated:
 *   get:
 *     tags:
 *       - SuppliedParts
 *     description: Returns paginated SuppliedParts
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
 * /api/v1/supplied-products/active:
 *   get:
 *     tags:
 *       - SuppliedParts
 *     description: Returns an array of SuppliedParts
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
 * /api/v1/supplied-products/products-supply/{id}:
 *   get:
 *     tags:
 *       - SuppliedParts
 *     description: Returns  SuppliedPart of a products supply
 *     parameters:
 *       - name: id
 *         description: SuppliedPart's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/product-supply/:id", requestHandler(controller.get_all_by_product_supply));


/**
 * @swagger
 * /api/v1/supplied-products/spare-products/{id}:
 *   get:
 *     tags:
 *       - SuppliedParts
 *     description: Returns  SuppliedPart
 *     parameters:
 *       - name: id
 *         description: SuppliedPart's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/product/:id", requestHandler(controller.get_by_product))

module.exports = router