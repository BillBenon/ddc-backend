const {ProductCategory, validate} = require("../../../models/ProductCategory/category.model");
const {validObjectId, dependencyChecker, API_RESPONSE} = require('../../../utils/common');
const _ = require('lodash')
const {Product} = require("../../../models/Product/product.model");

exports.get_all = async function (req, res) {
    const instances = await ProductCategory.find().sort({updatedAt: -1});
    return res.status(200).send(instances);
}
exports.get_by_id = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const category = await ProductCategory.findById(req.params.id);
    if (!category) return res.status(404).send('ProductCategory not found');
    return res.status(200).send(category);
}

exports.get_exists_by_name = async function (req, res) {
    const category = await ProductCategory.findOne({name: req.params.name});
    if (!category) return res.status(200).send({exists: false, object: null});
    return res.status(200).send({exists: true, object: category});
}

exports.create = async function (req, res) {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);


    const existing = await ProductCategory.findOne({name: req.body.name});
    if (existing) return res.status(400).send(API_RESPONSE(false, 'ProductCategory exists', null, 400));

    const category = new ProductCategory(req.body);

    const saved = await category.save();
    if (!saved) return res.status(500).send(API_RESPONSE(false, 'ProductCategory not saved', null, 500));
    return res.status(201).send(saved);
}

exports.update = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const {error} = validate(req.body);
    if (error) return res.status(400).send((API_RESPONSE(false, error.details[0].message, null, 400)))

    const category = await ProductCategory.findById(req.params.id);
    if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found', null, 404));

    const existing = await ProductCategory.findOne({name: req.body.name});
    if (existing && existing._id === req.params.id) return res.status(400).send(API_RESPONSE(false, 'ProductCategory exists', null, 400));

    const updated = await ProductCategory.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if (!updated) return res.status(500).send(API_RESPONSE(false, 'ProductCategory not updated', null, 500));
    return res.status(200).send(updated);
}
exports.get_all_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {limit: limit || 30, sort: {updatedAt: -1}, page: page || 1}

    const instances = await ProductCategory.paginate({}, options);
    return res.status(200).send(instances);
}


exports.search = async function (req, res) {
    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const instances = await ProductCategory.find({name: {$regex: regex}}).sort({updatedAt: -1});
    return res.status(200).send(instances);
}

exports.search_paginated = async function (req, res) {

    const {limit, page} = req.query;
    const options = {limit: limit || 30, sort: {updatedAt: -1}, page: page || 1}

    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const instances = await ProductCategory.paginate({name: {$regex: regex}}, options);
    return res.status(200).send(instances);
}

exports.delete = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const category = await ProductCategory.findById(req.params.id);
    if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found', null, 404));

    const dependency = await dependencyChecker(Product, 'product_category', req.params.id);
    if (dependency) return res.status(200).send(API_RESPONSE(false, 'Document cannot be deleted\nIt Has dependencies', null, 404));

    const deleted = await ProductCategory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(500).send(API_RESPONSE(false, 'ProductCategory not deleted', null, 500));
    return res.status(200).send(API_RESPONSE(true, 'ProductCategory deleted successfully', null, 200));
}


