const express = require("express")

const controller = require("../../controllers/v1/Order/product-order.controller")
const {requestHandler} = require("../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../middlewares/authorisation/isUserCategory.middleware");
const {USER_CATEGORY_ENUM} = require("../../utils/enumerations/constants");

const router = express.Router();


/**
 * @swagger
 * /api/v1/products-orders:
 *   get:
 *     tags:
 *       - PartOrders
 *     description: Returns an array of Orders
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/', requestHandler(controller.get_all))

/**
 * @swagger
 * /api/v1/products-orders/{id}:
 *   get:
 *     tags:
 *       - PartOrders
 *     description: Returns a single PartOrder
 *     parameters:
 *       - name: id
 *         description: PartOrder's id
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
 * /api/v1/products-orders/{id}:
 *   delete:
 *     tags:
 *       - PartOrders
 *     description: Deletes a single PartOrder
 *     parameters:
 *       - name: id
 *         description: PartOrder's id
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
router.delete('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.delete));

/**
 * @swagger
 * /api/v1/products-orders:
 *   post:
 *     tags:
 *       - PartOrders
 *     description: Creates a new PartOrder
 *     parameters:
 *       - name: body
 *         description: Fields for a PartOrder
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/PartOrder'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.post('/', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.create))


/**
 * @swagger
 * /api/v1/products-orders/paginated:
 *   get:
 *     tags:
 *       - PartOrders
 *     description: Returns an array of Orders
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/paginated', requestHandler(controller.get_all_paginated))


/**
 * @swagger
 * /api/v1/products-orders/active:
 *   get:
 *     tags:
 *       - PartOrders
 *     description: Returns an array of Orders
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/active', requestHandler(controller.get_all_active))


/**
 * @swagger
 * /api/v1/products-orders/order/{id}:
 *   get:
 *     tags:
 *       - PartOrders
 *     description: Returns an array PartOrders of a Order
 *     parameters:
 *       - name: id
 *         description: Order's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/order/:id', requestHandler(controller.get_all_by_order))


/**
 * @swagger
 * /api/v1/products-orders/products/push/{id}:
 *   put:
 *     tags:
 *       - PartOrders
 *     description: Creates a new PartOrder in Existing PartOrder
 *     parameters:
 *       - name: body
 *         description: Fields for a PartOrder
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/PartOrderNewProduct'
 *       - name: id
 *         description: Part Orders
 *         in: path
 *         required: true
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.put('/products/push/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.push_product))


/**
 * @swagger
 * /api/v1/products-orders/products/pop/{id}/product/{productId}:
 *   delete:
 *     tags:
 *       - PartOrders
 *     description: Creates a new PartOrder in Existing PartOrder
 *     parameters:
 *       - name: id
 *         description: Part Orders
 *         in: path
 *         required: true
 *       - name: productId
 *         description: Part Orders Product Id
 *         in: path
 *         required: true
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.delete('/products/pop/:id/product/:productId', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.pop_product));


module.exports = router;
