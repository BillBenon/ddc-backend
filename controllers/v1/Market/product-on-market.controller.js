const {
    ProductOnMarket,
    validate,
    PRODUCT_ON_MARKET_POPULATOR, validateUpdateProductOnMarket
} = require("../../../models/Market/product-on-market.model");
const {Product} = require("../../../models/Product/product.model");
const {shuffle} = require("../../../utils/common");
const {getWeekRange} = require("../../../utils/common");
const {getWeekOfMonth} = require("../../../utils/common");
const {COMPLETE_INFO_ENUM} = require("../../../utils/enumerations/constants");

const {ProductOrder} = require("../../../models/Order/product-order.model");
const {OrderDiscount} = require("../../../models/Discount/order-discount.model");
const {validObjectId, dependencyChecker, API_RESPONSE} = require('../../../utils/common');
const {Category} = require("../../../models/Employee/categories.model");
const {SuppliedProduct} = require("../../../models/Supply/supplied-products.model");


exports.get_all = async function (req, res) {
    const products = await ProductOnMarket.find().sort({
        showcase: -1,
        updatedAt: -1
    }).populate(PRODUCT_ON_MARKET_POPULATOR);
    return res.status(200).send((products));
}


exports.get_by_id = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send('Invalid ObjectId');
    const product = await ProductOnMarket.findById(req.params.id).populate(PRODUCT_ON_MARKET_POPULATOR);
    if (!product) return res.status(404).send("Product not at Market");
    return res.status(200).send(product);
}


exports.get_by_product = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send('Invalid ObjectId');
    const product = await ProductOnMarket.findOne({product: req.params.id}).populate(PRODUCT_ON_MARKET_POPULATOR);
    if (!product) return res.status(404).send("Product not at Market");
    return res.status(200).send(product);
}


exports.get_by_product_exists = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send('Invalid ObjectId');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(200).send({exists: false, object: null});

    const product_on_market = await ProductOnMarket.findOne({product: req.params.id, active: true});
    if (!product_on_market) return res.status(200).send({exists: false, object: null});

    return res.status(200).send({exists: true, object: product_on_market});
}

exports.create = async function (req, res) {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(API_RESPONSE(false, error.details[0].message, null, 400));

    const supplied_product = await SuppliedProduct.findOne({_id: req.body.supplied_product, active: true});
    if (!supplied_product) return res.status(404).send(API_RESPONSE(false, "Supplied product not found.", null, 400));

    const product = await Product.findOne({_id: supplied_product.product, active: true});
    if (!product) return res.status(404).send(API_RESPONSE(false, "active product not found.", null, 400));


    const SUPPLY_INSTANCE = {
        supplied_product: req.body.supplied_product,
        quantity: req.body.quantity
    }
    let supplies = []

    const existing = await ProductOnMarket.findOne({product: product._id, active: true});
    if (existing) {
        const new_quantity = existing.quantity + req.body.quantity;
        supplies = existing.supplies;
        supplies.push(SUPPLY_INSTANCE);

        const updated = await ProductOnMarket.findByIdAndUpdate(existing._id, {
            quantity: new_quantity,
            unit_price: req.body.unit_price,
            supplies: supplies
        }, {new: true});

        if (!updated) return res.status(500).send(API_RESPONSE(false, 'Update Failed', null, 500));
        return res.status(201).send(updated);
    } else {
        const TODAY = new Date();
        req.body.month = TODAY.getUTCMonth();
        req.body.year = TODAY.getUTCFullYear();
        req.body.day = TODAY.getUTCDate();
        const weekMappings = getWeekOfMonth(req.body.year, req.body.month);
        req.body.week = getWeekRange(weekMappings, req.body.day);
        req.body.product = product._id;

        supplies.push(SUPPLY_INSTANCE);
        req.body.supplies = supplies;

        const productOnMarket = new ProductOnMarket(req.body);
        const saved = await productOnMarket.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'Save Failed', null, 500));

        return res.status(201).send((saved));
    }
}

exports.update = async function (req, res) {

    const {error} = validateUpdateProductOnMarket(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const product_on_market = await ProductOnMarket.findOne({_id: req.params.id, active: true});
    if (!product_on_market) return res.status(404).send(API_RESPONSE(false, "Part not in Market", null, 500));

    req.body.quantity -= product_on_market.quantity + req.body.quantity;

    const updated = await ProductOnMarket.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true}
    );

    if (!updated) return res.status(500).send(API_RESPONSE(false, "Part in markert not updated", null, 500));
    return res.status(200).send((updated));
}

exports.delete = async function (req, res) {

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const part = await ProductOnMarket.findOne({_id: req.params.id, active: true});
    if (!part) return res.status(404).send(API_RESPONSE(false, "Part not in market", null, 500));

    const discountDependency = await dependencyChecker(OrderDiscount, 'part', req.params.id);
    const partOrderDependency = await dependencyChecker(ProductOrder, 'products.product', req.params.id);

    if (discountDependency || partOrderDependency)
        return res.status(200).send(API_RESPONSE(false, 'Record cannot be deleted\nIt has dependencies', null, 500));

    const deleted = await ProductOnMarket.findByIdAndUpdate(req.params.id, {active: false}, {new: true});
    if (!deleted)
        return res.status(500).send(API_RESPONSE(false, "Part not removed from Market", null, 500));

    return res.status(200).send(API_RESPONSE(false, "Part removed from Market", null, 500));
}


exports.get_all_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: PRODUCT_ON_MARKET_POPULATOR,
        sort: {complete_info_status: -1, showcase: -1, updatedAt: -1},
        page: page || 1
    }
    const instances = await ProductOnMarket.paginate({active: true}, options);
    return res.status(200).send(instances);
}

exports.search = async function (req, res) {
    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const products = await Product.find({
        $or: [
            {name: {$regex: regex}},
            {product_code: {$regex: regex}},
        ]
    }).sort({updatedAt: -1});
    const productIds = products.map(part => part._id);


    const products_on_market = await ProductOnMarket.find({product: {$in: productIds}}).sort({
        updatedAt: -1,
        showcase: -1
    });

    return res.status(200).send(products_on_market);

}

exports.get_all_by_second_hand = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: PRODUCT_ON_MARKET_POPULATOR,
        sort: {showcase: -1, updatedAt: -1},
        page: page || 1
    }

    const products = await Product.find({
        second_hand: true,
        complete_info_status: COMPLETE_INFO_ENUM.COMPLETE
    }).sort({updatedAt: -1});
    const productIds = products.map(product => product._id);


    const instances = await ProductOnMarket.paginate({
        product: {$in: productIds}, complete_info_status: COMPLETE_INFO_ENUM.COMPLETE,
        quantity: {$gt: 0}
    }, options)

    return res.status(200).send(instances);
}

exports.search_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: PRODUCT_ON_MARKET_POPULATOR,
        sort: {showcase: -1, updatedAt: -1},
        page: page || 1
    }

    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const products = await Product.find({
        $or: [
            {name: {$regex: regex}},
            {product_code: {$regex: regex}}
        ],
    }).sort({updatedAt: -1});
    const productIds = products.map(part => part._id);


    const instances = await ProductOnMarket.paginate({
        product: {$in: productIds}
    }, options);

    return res.status(200).send((instances));
}

exports.toggle_showcase = async function (req, res) {

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const existing = await ProductOnMarket.findOne({_id: req.params.id, active: true});
    if (!existing) return res.status(400).send(API_RESPONSE(false, 'Product not found', null, 400));

    const updated = await ProductOnMarket.findByIdAndUpdate(req.params.id, {showcase: !existing.showcase}, {new: true});
    if (!updated) return res.status(500).send(API_RESPONSE(false, 'Product not updated', null, 400));
    return res.status(200).send((updated));
}


exports.get_all_valid = async function (req, res) {
    const products = await ProductOnMarket.find({
        quantity: {$gt: 0},
        complete_info_status: COMPLETE_INFO_ENUM.COMPLETE
    }).sort({
        showcase: -1,
        updatedAt: -1
    }).populate(PRODUCT_ON_MARKET_POPULATOR);

    return res.status(200).send((products));
}


exports.get_all_vanishing = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 10,
        populate: PRODUCT_ON_MARKET_POPULATOR,
        sort: {quantity: 1},
        page: page || 1
    }

    const products = await ProductOnMarket.paginate({
        quantity: {$lt: 5},
        complete_info_status: COMPLETE_INFO_ENUM.COMPLETE
    }, options);

    return res.status(200).send(products);
}

exports.get_all_recommendation = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: PRODUCT_ON_MARKET_POPULATOR,
        sort: {updatedAt: -1},
        page: page || 1
    }

    const instances = await ProductOnMarket.paginate({
        active: true,
        complete_info_status: COMPLETE_INFO_ENUM.COMPLETE
    }, options);

    instances.docs = shuffle(instances.docs);

    return res.status(200).send(instances);
}


exports.get_all_top_products = async function (req, res) {
    const instances = await ProductOnMarket.find({
        active: true,
        complete_info_status: COMPLETE_INFO_ENUM.COMPLETE,
        showcase: true
    }).sort({updatedAt: -1}).populate(PRODUCT_ON_MARKET_POPULATOR);

    return res.status(200).send(instances);
}


exports.get_all_by_category = async function (req, res) {

    if (!(validObjectId(req.params.category)))
        return res.status(400).send(API_RESPONSE(false, 'INVALID OBJECTED', null, 400));

    const category = await Category.findById(req.params.category)
    if (!category) return res.status(200).send(API_RESPONSE(false, 'Product Sub ProductCategory not found', null, 400));


    const products = await Product.find({
        'category': req.params.category,
        complete_info_status: COMPLETE_INFO_ENUM.COMPLETE
    })

    const productIds = products.map(product => product._id)

    const instances = await ProductOnMarket.find({
        product: {$in: productIds},
        complete_info_status: COMPLETE_INFO_ENUM.COMPLETE
    }).populate(PRODUCT_ON_MARKET_POPULATOR);

    return res.send(instances)
}
