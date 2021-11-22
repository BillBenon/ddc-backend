const express = require("express");

const {
    SuppliedProduct,
    validate,
    SUPPLIED_PRODUCTS_POPULATOR
} = require("../../../models/Supply/supplied-products.model");
const {ProductSupply} = require("../../../models/Supply/product-supply.model");
const {Product} = require('../../../models/Product/product.model');
const router = express.Router();
const {validObjectId, API_RESPONSE, immutate} = require('../../../utils/common');

const {Income} = require("../../../models/Reporting/income.model");
const {ProductOnMarket} = require("../../../models/Market/product-on-market.model");

exports.get_all = async function (req, res) {
    const products = await SuppliedProduct.find().sort({updatedAt: -1}).populate(SUPPLIED_PRODUCTS_POPULATOR);
    return res.status(200).send(products);
}


exports.get_all_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: SUPPLIED_PRODUCTS_POPULATOR,
        sort: {updatedAt: -1},
        page: (page) || 1
    }
    const parts = await SuppliedProduct.paginate({active: true}, options);
    return res.status(200).send(parts);
}

exports.get_all_active = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: SUPPLIED_PRODUCTS_POPULATOR,
        sort: {updatedAt: -1},
        page: (page) || 1
    }

    const parts = await SuppliedProduct.paginate({active: true}, options);
    return res.status(200).send(parts);
}


exports.get_all_by_product_supply = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
    const products = await SuppliedProduct.find({
        product_supply: req.params.id,
        active: true
    }).populate(SUPPLIED_PRODUCTS_POPULATOR);
    return res.status(200).send(products);
}


exports.get_by_product = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
    const products = await SuppliedProduct.find({product: req.params.id}).populate(SUPPLIED_PRODUCTS_POPULATOR);
    return res.status(200).send(products);
}

exports.get_by_id = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const product = await SuppliedProduct.findOne({
        _id: req.params.id,
        active: true
    }).populate(SUPPLIED_PRODUCTS_POPULATOR);
    if (!product) return res.status(404).send(API_RESPONSE(false, "SuppliedPart not found", null, 400));

    return res.status(200).send(product);
}

exports.create = async function (req, res) {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const productSupply = await ProductSupply.findOne({_id: req.body.product_supply, active: true});
    if (!productSupply) return res.status(404).send(API_RESPONSE(false, "PartSupply not found", null, 400));

    const product = await Product.findOne({_id: req.body.product, active: true})
    if (!product) return res.status(404).send(API_RESPONSE(false, "Product not found", null, 400));

    req.body.current_quantity = req.body.quantity;

    const suppliedProduct = new SuppliedProduct(req.body);


    const saved = await suppliedProduct.save();
    if (!saved) return res.status(500).send(API_RESPONSE(false, "SuppliedPart not saved", null, 400));
    productSupply.supply_price += req.body.supply_price;
    productSupply.supply_quantity += req.body.quantity;

    const updated = await productSupply.save();

    if (!updated) return res.status(500).send(API_RESPONSE(false, "PartSupply not updated", null, 400));

    return res.status(201).send(saved);

}


/**
 * @swagger
 * /api/v1/supplied-parts/{id}:
 *   put:
 *     tags:
 *       - SuppliedParts
 *     description: Updates a SuppliedPart
 *     parameters:
 *       - name: body
 *         description: Fields for a SuppliedPart
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/SuppliedPart'
 *       - name: id
 *         in: path
 *         type: string
 *         description: SuppliedPart's id
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

router.put("/:id", async (req, res) => {

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const supply = await SuppliedProduct.findOne({_id: req.params.id, active: true});
    if (!supply) return res.status(404).send(API_RESPONSE(false, "Supply not found", null, 400));

    const productSupply = await ProductSupply.findOne({_id: req.body.product_supply, active: true});
    if (!productSupply) return res.status(404).send(API_RESPONSE(false, "PartSupply not found", null, 400));

    if (req.body.quantity < 1)
        return res.status(400).send(API_RESPONSE(false, "Supply Quantity should be greater than zero.", null, 400));
    if (req.body.supply_price < 1)
        return res.status(400).send(API_RESPONSE(false, "Supply Quantity should be greater than zero.", null, 400));


    let product = await Product.findOne({_id: req.body.product, active: true}).populate([{
        path: 'product_category'
    }]);
    product = immutate(product);
    if (!product) return res.status(404).send(API_RESPONSE(false, "Product not found", null, 400));

    product.productOnMarket = await ProductOnMarket.findOne({product: product._id}).select('-product');

    req.body.current_quantity = req.body.quantity;

    const productOnMarket = await ProductOnMarket.findById(product.productOnMarket._id);
    productOnMarket.quantity = productOnMarket.quantity + (parseInt(supply.quantity) - parseInt(req.body.quantity));
    await productOnMarket.save();


    productSupply.supply_price = (productSupply.supply_price - supply.supply_price) + req.body.supply_price;
    productSupply.supply_quantity = (productSupply.supply_quantity - supply.quantity) + req.body.quantity;
    await productSupply.save();


    const updated = await SuppliedProduct.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true}
    );
    if (!updated) return res.status(500).send(API_RESPONSE(false, "SuppliedPart not updated", null, 400));
    return res.status(200).send(updated);

});


exports.delete = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const supply = await SuppliedProduct.findOne({_id: req.params.id, active: true}).populate("part_supply");
    if (!supply) return res.status(404).send(API_RESPONSE(false, "Supply not found", null, 400));

    // remove the supplied parts in the parts in stock
    let productsOnMarket = await ProductOnMarket.find({"supplies.supplied_product": req.params.id})
    for (const product of productsOnMarket) {
        product.supplies = product.supplies.filter(supplyItem => supplyItem.supplied_product !== req.params.id);
        await product.save();
    }

    const deleted = await SuppliedProduct.findByIdAndUpdate(req.params.id, {active: false}, {new: true});
    if (!deleted)
        return res.status(500).send(API_RESPONSE(false, "SuppliedPart not deleted", null, 400));

    if (supply.product_supply) {
        let income = await Income.findOne({
            day: supply.product_supply.day,
            month: supply.product_supply.day,
            year: supply.product_supply.day,
        })

        if (income) {
            income.total_supply.items -= supply.quantity
            income.total_supply.payments -= supply.supply_price

            await income.save();
        }
    }
    return res.status(200).send(API_RESPONSE(true, "SuppliedPart deleted", null, 200));

}




