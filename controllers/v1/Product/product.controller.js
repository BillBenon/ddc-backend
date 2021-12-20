const {immutate, fileFromPathUnlink, cloudinary_configuration} = require("../../../utils/common");
const {ProductCategory} = require("../../../models/ProductCategory/category.model");
const {ProductOnMarket} = require("../../../models/Market/product-on-market.model");
const {SuppliedProduct} = require("../../../models/Supply/supplied-products.model");
const {Product, validate, PRODUCT_POPULATOR} = require("../../../models/Product/product.model");
const {validObjectId, dependencyChecker, API_RESPONSE} = require('../../../utils/common');


exports.get_all = async function (req, res) {
    const products = await Product.find({active: true}).sort({updatedAt: -1}).populate(PRODUCT_POPULATOR);
    return res.status(200).send(products);
}

exports.create = async function (req, res) {
    let {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let category = await ProductCategory.findById(req.body.product_category);
    if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found.', null, 404));


    // let existing = await Product.findOne({product_code: req.body.product_code, active: true})
    // if (existing) return res.status(400).send(API_RESPONSE(false, "Product Code already exists", null, 400))

    const product = new Product(req.body);

    const saved = await product.save();
    if (!saved) return res.status(500).send(API_RESPONSE(false, 'Spare part not saved', null, 400));
    return res.status(200).send((saved));
}

exports.update = async function (req, res) {

    let {error} = validate(req.body);
    if (error) return res.send(error.details[0].message);

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    let category = await ProductCategory.findById(req.body.product_category);
    if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found.', null, 404));

    const product = await Product.findOne({_id: req.params.id, active: true});
    if (!product) return res.status(404).send({success: false, message: "Product not found"});


    const updated = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true}
    );
    if (!updated) return res.status(500).send(API_RESPONSE(false, "Unable update the spare part", null, 400));
    return res.send(200).send(updated);
}


exports.get_by_id = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    let product = await Product.findById(req.params.id).populate(PRODUCT_POPULATOR);
    if (product) return res.send(product);
    return res.status(404).send(API_RESPONSE(false, "Spare part not found !!! ", null, 400));
}

exports.delete = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const product = await Product.findOne({_id: req.params.id, active: true})
    if (!product) return res.status(404).send(API_RESPONSE(false, "Spare part not found", null, 400));

    const suppliedPartDependency = await dependencyChecker(SuppliedProduct, 'product', req.params.id);
    if (suppliedPartDependency) return res.status(200).send(API_RESPONSE(false, 'Document cannot be deleted\nIt Has dependencies', null, 400));


    const deleted = await Product.findByIdAndUpdate(req.params.id, {active: false}, {new: true});
    for (const path of deleted.photos)
        await fileFromPathUnlink(path);

    if (!deleted) return res.status(500).send(API_RESPONSE(false, 'Product not deleted', null, 400));

    return res.status(200).send(API_RESPONSE(true, 'Deleted Successfully', null, 400));
}

exports.code_exists = async function (req, res) {
    const product = await Product.findOne({product_code: req.params.code, active: true});

    if (!product) return res.status(200).send({
        exists: false,
        message: "Product Available"
    });

    return res.status(200).send({
        exists: true,
        message: "ProductCode Already Exists",
        object: product
    });
}

exports.get_all_active = async function (req, res) {
    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: PRODUCT_POPULATOR, sort: {updatedAt: -1}, page: (page) || 1}

    const products = await Product.paginate({active: true}, options);
    return res.status(200).send(products);
}

exports.search_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: PRODUCT_POPULATOR, sort: {updatedAt: -1}, page: (page) || 1}

    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const products = await Product.paginate({
        $or: [
            {name: {$regex: regex}},
            {product_code: {$regex: regex}}
        ]
    }, options);
    return res.status(200).send(products);
}

exports.search = async function (req, res) {
    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const spareParts = await Product.find({
        $or: [
            {name: {$regex: regex}},
            {product_code: {$regex: regex}},
        ]
    }).sort({updatedAt: -1}).populate(PRODUCT_POPULATOR);
    return res.status(200).send(spareParts);
}


exports.get_all_category = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const products = await Product.find({'product_category': req.params.id}).sort({
        showcase: -1,
        updatedAt: -1
    });
    return res.status(404).send(products);
}

exports.get_all_category_paginated = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: PRODUCT_POPULATOR,
        sort: {showcase: -1, updatedAt: -1},
        page: (page) || 1
    }

    const products = await Product.paginate({'product_category': req.params.id}, options);
    return res.status(404).send(products);
}


exports.get_details = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    let product = await Product.findById(req.params.id).populate(PRODUCT_POPULATOR);
    product = immutate(product);
    if (!product)
        return res.status(404).send(API_RESPONSE(false, "Spare part not found !!! ", null, 400));

    const productOnMarket = await ProductOnMarket.findOne({product: product._id}).select('-product');
    return res.send(productOnMarket);
}


exports.upload_pic = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    if (!req.file) return res.status(400).send(API_RESPONSE(false, 'No file found', null, 400));

    const product = await Product.findOne({_id: req.params.id, active: true});
    if (!product) return res.status(404).send(API_RESPONSE(false, 'Product not found', null, 400));


    await cloudinary_configuration.uploader.upload(req.file.image, function (err, result) {
        product.photos.push({path: result.url})
    })

    const updated = await product.save();
    if (updated) return res.status(201).send((updated));
    return res.status(500).send(API_RESPONSE(false, 'An error occurred', null, 400))

}

exports.delete_pic = async function (req, res) {
    if (!(validObjectId(req.params.id)) || !validObjectId(req.params.imageId)) return res.status(400).send('Invalid ObjectId');

    const sparePart = await Product.findOne({_id: req.params.id, active: true});
    if (!sparePart) return res.status(404).send(API_RESPONSE(false, 'Product not found', null, 400));

    const image = await Product.findOne({'photos._id': req.params.imageId});
    if (!image) return res.status(404).send(API_RESPONSE(false, 'Image not found', null, 400));


    sparePart.photos.splice(sparePart.photos.findIndex(item => item._id === req.params.imageId), 1)

    const updated = await sparePart.save();
    if (updated) return res.status(201).send((updated));
    return res.status(500).send(API_RESPONSE(false, 'Product not updated', null, 400))
}


exports.get_all_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: PRODUCT_POPULATOR,
        sort: {complete_info_status: -1, updatedAt: -1},
        page: (page) || 1
    }

    const products = await Product.paginate({active: true}, options);
    return res.status(200).send(products);
}


