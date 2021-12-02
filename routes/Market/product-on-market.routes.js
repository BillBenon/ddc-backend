const express = require("express")

const controller = require("../../controllers/v1/Market/product-on-market.controller")
const {requestHandler} = require("../../utils/common");
const {AUTH_MIDDLEWARE} = require("../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../middlewares/authorisation/isUserCategory.middleware");
const {USER_CATEGORY_ENUM} = require("../../utils/enumerations/constants");
const {uploadProductPic} = require("../../middlewares/multer.middleware");

const router = express.Router();


/**
 * @swagger
 * /api/v1/products-on-market:
 *   get:
 *     tags:
 *       - PartsOnMarket
 *     description: Returns an array of spare products at market
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/", requestHandler(controller.get_all));

/**
 * @swagger
 * /api/v1/products-on-market/top-products:
 *   get:
 *     tags:
 *       - PartsOnMarket
 *     description: Returns an array of spare products at market
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/top-products", requestHandler(controller.get_all_top_products))


/**
 * @swagger
 * /api/v1/products-on-market/recommendation:
 *   get:
 *     tags:
 *       - PartsOnMarket
 *     description: Returns an array of spare products at market
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/recommendation", requestHandler(controller.get_all_recommendation));

/**
 * @swagger
 * /api/v1/products-on-market/paginated:
 *   get:
 *     tags:
 *       - ProductsOnMarket
 *     description: Returns an array of ProductsOnMarket
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
router.get("/paginated", requestHandler(controller.get_all_paginated));

/**
 * @swagger
 * /api/v1/products-on-market/{id}:
 *   get:
 *     tags:
 *       - PartsOnMarket
 *     description: Returns a single part on makert
 *     parameters:
 *       - name: id
 *         description: part in stock's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/:id", requestHandler(controller.get_by_id))


/**
 * @swagger
 * /api/v1/products-on-market/product/{id}:
 *   get:
 *     tags:
 *       - ProductOnMarket
 *     description: Returns a single part on makert
 *     parameters:
 *       - name: id
 *         description: part in stock's id
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


/**
 * @swagger
 * /api/v1/products-on-market/product/{id}/exists:
 *   get:
 *     tags:
 *       - PartsOnMarket
 *     description: Returns a single part on makert
 *     parameters:
 *       - name: id
 *         description: part in stock's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/product/:id/exists", requestHandler(controller.get_by_product_exists))

/**
 * @swagger
 * /api/v1/products-on-market:
 *   post:
 *     tags:
 *       - PartsOnMarket
 *     description: Adds a part in stock to markert
 *     parameters:
 *       - name: body
 *         description: Fields for a part
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/PartOnMarket'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */
router.post("/", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.create));


/**
 * @swagger
 * /api/v1/products-on-market/{id}:
 *   put:
 *     tags:
 *       - PartsOnMarket
 *     description: Updates a part at Markert
 *     parameters:
 *       - name: body
 *         description: Fields for a Markerting part
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/PartOnMarket'
 *       - name: id
 *         in: path
 *         type: string
 *         description: Markerting's part
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
 * /api/v1/products-on-market/toogle/showcase/{id}:
 *   put:
 *     tags:
 *       - PartsOnMarket
 *     description: Updates a PartsOnMarket
 *     parameters:
 *       - name: id
 *         in: path
 *         type: string
 *         description: Product's Id
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
router.put('/toogle/showcase/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], requestHandler(controller.toggle_showcase))


/**
 * @swagger
 * /api/v1/products-on-market/{id}:
 *   delete:
 *     tags:
 *       - ProductsOnMarket
 *     description: Remove the part from the Market
 *     parameters:
 *       - name: id
 *         description: Markerting part's id
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
 * /api/v1/products-on-market/search:
 *   get:
 *     tags:
 *       - ProductsOnMarket
 *     description: Returns ProductsOnMarket with a certain name
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
router.get('/search', requestHandler(controller.search));


/**
 * @swagger
 * /api/v1/products-on-market/second_hand:
 *   get:
 *     tags:
 *       - ProductsOnMarket
 *     description: Returns the Second hand spare products on markert
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/second_hand', requestHandler(controller.get_all_by_second_hand));


/**
 * @swagger
 * /api/v1/products-on-market/search/paginated:
 *   get:
 *     tags:
 *       - ProductsOnMarket
 *     description: Returns Paginated ProductsOnMarket with a certain name
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
router.get('/search/paginated', requestHandler(controller.search_paginated));


/**
 * @swagger
 * /api/v1/products-on-market/valid:
 *   get:
 *     tags:
 *       - PartsOnMarket
 *     description: Returns an array of spare products at market
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/valid", requestHandler(controller.get_all_valid))

/**
 * @swagger
 * /api/v1/products-on-market/vanishing-products:
 *   get:
 *     tags:
 *       - PartsOnMarket
 *     description: Returns an array of spare products at market
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/vanishing-products", requestHandler(controller.get_all_vanishing));





/**
 * @swagger
 * /api/v1/products-on-market/category/{category}:
 *   get:
 *     tags:
 *       - PartsOnMarket
 *     description: Returns an array of spare products at market
 *     parameters:
 *       - name: category
 *         description: ProductCategory id
 *         in: path
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/category/:category", requestHandler(controller.get_all_by_category))


module.exports = router