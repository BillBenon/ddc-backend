const express = require("express")

const controller = require("../../controllers/v1/Discount/applied-discount.controller")
const {requestHandler} = require("../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../middlewares/authorisation/isUserCategory.middleware");
const {USER_CATEGORY_ENUM} = require("../../utils/enumerations/constants");

const router = express.Router();


/**
 * @swagger
 * /api/v1/applied-discounts:
 *   get:
 *     tags:
 *       - applied-discounts-controller
 *     description: Returns an array of applied-discounts
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
 * /api/v1/applied-discounts/{id}:
 *   get:
 *     tags:
 *       - applied-discounts-controller
 *     description: Returns an array of delivery-ports
 *     parameters:
 *       - name: id
 *         description: The id of the applied-discount
 *         in: path
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', requestHandler(controller.get_by_id))


/**
 * @swagger
 * /api/v1/applied-discounts/discount/{id}:
 *   get:
 *     tags:
 *       - applied-discounts-controller
 *     description: Returns an array of applied-discounts under a specified discount.
 *     parameters:
 *       - name: id
 *         description: The id of the discount
 *         in: path
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/discount/:id', requestHandler(controller.get_all_by_order_discount));


/**
 * @swagger
 * /api/v1/applied-discounts:
 *   post:
 *     tags:
 *       - applied-discounts-controller
 *     description: Returns an array of applied-discount
 *     parameters:
 *       - name: body
 *         description: Fields for a AppliedDiscount
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/AppliedDiscount'
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.post('/', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.create))

/**
 * @swagger
 * /api/v1/applied-discounts/order/{id}/availability/details:
 *   get:
 *     tags:
 *       - applied-discounts-controller
 *     description: Returns an array of applied-discounts-controller from order
 *     parameters:
 *       - name: order
 *         description: The id of the order
 *         in: path
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/order/:id/availability/details', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.CUSTOMER])], requestHandler(controller.get_active_applied_discounts));

module.exports = router