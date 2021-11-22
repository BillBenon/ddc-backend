const {PRODUCT_ORDER_POPULATOR} = require("../../../models/Order/product-order.model");
const {ORDER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {API_RESPONSE} = require("../../../utils/common");
const {ProductOrder, validate, validateNewProduct} = require("../../../models/Order/product-order.model");
const {Order, POPULATOR: ORDER_POPULATOR} = require('../../../models/Order/order.model');
const {ProductOnMarket} = require("../../../models/Market/product-on-market.model");
const {validObjectId} = require('../../../utils/common');


exports.get_all = async function (req, res) {
    const orders = await ProductOrder.find().sort({updatedAt: -1}).populate(PRODUCT_ORDER_POPULATOR);
    return res.status(200).send(orders);
}


exports.get_all_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: PRODUCT_ORDER_POPULATOR,
        sort: {updatedAt: -1},
        page: (page) || 1
    }

    const orders = await ProductOrder.paginate({active: true}, options)
    return res.status(200).send(orders);
}

exports.get_all_active = async function (req, res) {

    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: 'order products.product',
        sort: {updatedAt: -1},
        page: (page) || 1
    }

    const orders = await ProductOrder.paginate({active: true}, options)
    return res.status(200).send(orders);
}

exports.get_by_id = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const order = await ProductOrder.findById(req.params.id).populate(PRODUCT_ORDER_POPULATOR);
    if (!order) return res.status(404).send(API_RESPONSE(false, 'PartOrder not found', null, 500));
    return res.status(200).send(order);
}

exports.get_all_by_order = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const order = await Order.findOne({_id: req.params.id, active: true}).populate(ORDER_POPULATOR);
    if (!order) return res.status(404).send(API_RESPONSE(false, 'Order not found', null, 500));
    const partOrders = await ProductOrder.find({order: req.params.id}).sort({updatedAt: -1}).populate(PRODUCT_ORDER_POPULATOR);

    return res.status(200).send(partOrders);
}

exports.create = async function (req, res) {
    let total_quantities = 0;

    let total_prices = 0;
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const existing = await ProductOrder.findOne({order: req.body.order});
    if (existing) return res.status(404).send(API_RESPONSE(false, 'Order already exists', null, 500));

    const order = await Order.findOne({_id: req.body.order, status: ORDER_STATUS_ENUM.INITIATED});
    if (!order) return res.status(404).send(API_RESPONSE(false, 'Order not found', null, 500));

    if (order.expiration_date < Date.now()) {
        order.status = ORDER_STATUS_ENUM.EXPIRED;
        return res.status(400).send(API_RESPONSE(false, 'Order has expired', null, 400))
    }


    for (const product of req.body.products) {
        const partOnMarket = await ProductOnMarket.findOne({_id: product.product, active: true});
        if (!partOnMarket) return res.status(404).send(API_RESPONSE(false, 'Product not found', null, 500));

        if (partOnMarket.quantity < product.quantity)
            return res.status(400).send(API_RESPONSE(false, 'Can not save entity\nCheck your quantities', null, 500));

        partOnMarket.quantity -= product.quantity;
        product.price = (product.quantity * partOnMarket.unit_price);
        await partOnMarket.save();

        total_prices += product.price;
        total_quantities += product.quantity;
    }


    req.body.total_product_quantities = total_quantities;
    req.body.total_products_price = total_prices;

    const partOrder = new ProductOrder(req.body);

    const saved = await partOrder.save();
    if (!saved) return res.status(500).send(API_RESPONSE(false, 'PartOrder not saved', null, 500));

    order.total_order_price = total_prices;
    order.total_order_quantities = total_quantities;
    order.status = ORDER_STATUS_ENUM.PAYING;

    await order.save();

    return res.status(201).send(saved);

}


exports.push_product = async function (req, res) {
    let total_quantities = 0;
    let total_prices = 0;
    const {error} = validateNewProduct(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const partOrder = await ProductOrder.findOne({_id: req.params.id, active: true});
    if (!partOrder) return res.status(404).send(API_RESPONSE(false, 'Part Order Not found', null, 500));

    for (const product of req.body.products) {

    }

    for (const product of req.body.products) {
        const duplicate = partOrder.products.find(element =>
            element.product.toString() === product.product
        );
        if (duplicate) return res.status(400).send(API_RESPONSE(false, 'Product already exists', null, 500));

        const partOnMarket = await ProductOnMarket.findOne({_id: product.product, active: true});
        if (!partOnMarket) return res.status(404).send(API_RESPONSE(false, 'Product not found', null, 500));

        if ((partOnMarket.current_quantity < product.quantity) && (partOnMarket.current_quantity > 0))
            return res.status(400).send(API_RESPONSE(false, 'Can not save entity\nCheck your quantities', null, 500));

        partOnMarket.quantity -= product.quantity;
        product.price = (product.quantity * partOnMarket.unit_price);
        await partOnMarket.save();

        total_prices += product.price;
        total_quantities += product.quantity;

        partOrder.products.push(product)
    }

    const order = await Order.findById(partOrder.order);
    if (!order) return res.status(404).send(API_RESPONSE(false, 'Order not found', null, 500));


    partOrder.total_product_quantities += total_quantities;
    partOrder.total_products_price += total_prices;


    const saved = await partOrder.save();
    if (!saved) return res.status(500).send(API_RESPONSE(false, 'PartOrder not saved', null, 500));

    order.total_order_price = partOrder.total_products_price;
    order.total_order_quantities = partOrder.total_products_price;
    order.status = 'PAYING';

    await order.save();

    return res.status(201).send(saved);

}

exports.pop_product = async function (req, res) {
    const partOrder = await ProductOrder.findById(req.params.id);
    if (!partOrder) return res.status(404).send(API_RESPONSE(false, 'Part Order Not found', null, 500));

    const partOnMarket = await ProductOnMarket.findOne({_id: req.params.productId, active: true});
    if (!partOnMarket) return res.status(404).send(API_RESPONSE(false, 'Product not found', null, 500));

    const product = partOrder.products.find(element =>
        element.product.toString() === req.params.productId
    );

    partOnMarket.quantity += product.quantity;
    await partOnMarket.save();

    const index = partOrder.products.findIndex(i => {
        return i.product.toString() === req.params.productId
    });

    partOrder.products.splice(index, 1);


    const order = await Order.findById(partOrder.order);
    if (!order) return res.status(404).send(API_RESPONSE(false, 'Order not found', null, 500));

    partOrder.total_product_quantities -= product.quantity;
    partOrder.total_products_price -= product.price;

    const saved = await partOrder.save();
    if (!saved) return res.status(500).send(API_RESPONSE(false, 'PartOrder not saved', null, 500));

    if (partOrder.products.length < 1)
        order.status = 'INITIATED';

    order.total_order_price = partOrder.total_products_price;

    await order.save();
    return res.status(201).send(saved);
}


exports.delete = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const order = await ProductOrder.findOne({_id: req.params.id, active: true});
    if (!order) return res.status(404).send(API_RESPONSE(false, 'PartOrder not found', null, 500));

    const deleted = await ProductOnMarket.findByIdAndUpdate(req.params.id, {active: false}, {new: true});
    if (!deleted) return res.status(500).send(API_RESPONSE(false, 'PartOrder not updated', null, 500));
    return res.status(200).send(API_RESPONSE(false, 'PartOrder deleted successfully', null, 500));
}


