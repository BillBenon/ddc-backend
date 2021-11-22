const express = require("express")

const controller = require("../../controllers/v1/Order/order.controller")
const {requestHandler} = require("../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../middlewares/authorisation/isUserCategory.middleware");
const {USER_CATEGORY_ENUM} = require("../../utils/enumerations/constants");
const {request} = require("express");

const router = express.Router();


/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     tags:
 *       - Orders
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
 * /api/v1/orders/{id}:
 *   put:
 *     tags:
 *       - Orders
 *     description: Updates a Order
 *     parameters:
 *       - name: body
 *         description: Fields for a Order
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Order'
 *       - name: id
 *         in: path
 *         type: string
 *         description: Order's Id
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
router.put('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.update));


/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     tags:
 *       - Orders
 *     description: Deletes a single Order
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
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.delete))

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns a single Order
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
router.get('/:id', requestHandler(controller.get_by_id));

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     tags:
 *       - Orders
 *     description: Creates a new Order
 *     parameters:
 *       - name: body
 *         description: Fields for a Order
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Order'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.post('/', [AUTH_MIDDLEWARE], requestHandler(controller.create));


/**
 * @swagger
 * /api/v1/orders/{id}:
 *   put:
 *     tags:
 *       - Orders
 *     description: Updates a Order
 *     parameters:
 *       - name: body
 *         description: Fields for a Order
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Order'
 *       - name: id
 *         in: path
 *         type: string
 *         description: Order's Id
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
router.put('/:id/status/:status', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.change_status));


/**
 * @swagger
 * /api/v1/orders/paginated:
 *   get:
 *     tags:
 *       - Orders
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
 * /api/v1/orders/active:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns an array of Orders
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/active', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.get_all_active));


/**
 * @swagger
 * /api/v1/orders/past-week:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns an array of Orders made in past week
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/past-week", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.get_passed_week))


/**
 * @swagger
 * /api/v1/orders/status/{status}:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns an array of Orders
 *     parameters:
 *     - in: path
 *       name: status
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/status/:status', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.get_all_by_status))


/**
 * @swagger
 * /api/v1/orders/search:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns Orders with a certain name
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
 * /api/v1/orders/search/paginated:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns Paginated Discounts with a certain name
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
 * /api/v1/orders/status/{status}/paginated:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns an array of Orders
 *     parameters:
 *     - in: path
 *       name: status
 *       required: true
 *       type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/status/:status/paginated', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.get_all_by_status_paginated));


/**
 * @swagger
 * /api/v1/orders/statistics:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns an array of Orders of last week
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/statistics', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.get_statistics))


/**
 * @swagger
 * /api/v1/orders/{id}/details:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns a single Order
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
router.get('/:id/details', requestHandler(controller.get_details))


/**
 * @swagger
 * /api/v1/orders/customer/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns an array Orders of a Customer
 *     parameters:
 *       - name: id
 *         description: Customer's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/customer/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.get_all_by_customer))


/**
 * @swagger
 * /api/v1/orders/customer/{id}/paginated:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns an array Orders of a Customer
 *     parameters:
 *       - name: id
 *         description: Customer's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/customer/:id/paginated', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.get_all_by_customer_paginated))


/**
 * @swagger
 * /api/v1/orders/customer/{id}/search/paginated:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns Paginated Discounts with a certain name
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
router.get('/customer/:id/search/paginated', requestHandler(controller.search_by_customer_paginated))


/**
 * @swagger
 * /api/v1/orders/customer/{id}/statistics:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns an array Orders of a Customer
 *     parameters:
 *       - name: id
 *         description: Customer's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/customer/:id/statistics', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.get_customer_statistics))


/**
 * @swagger
 * /api/v1/orders/{id}/delivery-locations:
 *   put:
 *     tags:
 *       - Orders
 *     description: Creates a new Order deliveryLocation
 *     parameters:
 *       - name: id
 *         description: Order Id
 *         in: path
 *         required: true
 *       - name: body
 *         description: Fields for a Order
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/OrderDeliveryLocation'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id/delivery-locations', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.get_delivery_location_details));


module.exports = router
