const express = require("express");
const {getWeekRange} = require("../../../utils/common");
const {getWeekOfMonth} = require("../../../utils/common");
const {User, getAllAdmins, getAllSalesManagers} = require("../../../models/User/user.model");
const {
    EMPLOYEE_STATUS_ENUM,
    NOTIFICATION_TYPE_ENUM,
    DATE,
    USER_CATEGORY_ENUM, USER_STATUS_ENUM
} = require("../../../utils/enumerations/constants");
const {SUPPLIER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {SuppliedProduct} = require("../../../models/Supply/supplied-products.model");
const {ProductSupply, validate, PRODUCT_SUPPLY_POPULATOR} = require("../../../models/Supply/product-supply.model");
const {Supplier} = require("../../../models/Supply/supplier.model");
const {Employee} = require('../../../models/Employee/employees.model');
const router = express.Router();
const {validObjectId, API_RESPONSE, dependencyChecker} = require('../../../utils/common');
const {notifyMany} = require("../User/notifications.controller");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");

exports.get_all = async function (req, res) {
    const parts = await ProductSupply.find().sort({updatedAt: -1}).populate(PRODUCT_SUPPLY_POPULATOR);
    res.status(200).send(parts);
}

exports.get_all_past_week = async function (req, res) {
    const supplies = await ProductSupply.find({createdAt: {$gte: DATE.THIS_WEEK}}).populate(PRODUCT_SUPPLY_POPULATOR)
    return res.send(supplies)
}

exports.get_all_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: PRODUCT_SUPPLY_POPULATOR,
        sort: {updatedAt: -1},
        page: (page) || 1
    }

    const parts = await ProductSupply.paginate({active: true}, options);

    res.status(200).send(parts);
}

exports.get_all_active = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: PRODUCT_SUPPLY_POPULATOR,
        sort: {updatedAt: -1},
        page: (page) || 1
    }

    const parts = await ProductSupply.paginate({active: true}, options);
    res.status(200).send(parts);
}

exports.search = async function (req, res) {

    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const users = await User.find({$or: [{firstName: {$regex: regex}}, {lastName: {$regex: regex}}]});
    const userIds = users.map(user => user._id);

    const suppliers = await Supplier.find({user: {$in: userIds}}).populate(PRODUCT_SUPPLY_POPULATOR);
    const ids = suppliers.map(supplier => supplier._id);

    const instances = await ProductSupply.find({supplier: {$in: ids}}).sort({updatedAt: -1}).populate(PRODUCT_SUPPLY_POPULATOR);

    return res.status(200).send(instances);

}

exports.search_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: PRODUCT_SUPPLY_POPULATOR,
        sort: {updatedAt: -1},
        page: (page) || 1
    }

    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const users = await User.find({
        $or: [
            {firstName: {$regex: regex}},
            {lastName: {$regex: regex}},
            {username: {$regex: regex}}
        ]
    });
    const userIds = users.map(user => user._id);

    const suppliers = await Supplier.find({user: {$in: userIds}}).populate(PRODUCT_SUPPLY_POPULATOR);
    const ids = suppliers.map(supplier => supplier._id);

    const instances = await ProductSupply.paginate({supplier: {$in: ids}}, options)

    return res.status(200).send(instances);
}

exports.get_statistics = async function (req, res) {
    const count = await ProductSupply.find().sort({updatedAt: -1}).countDocuments();
    res.status(200).send({totalSupplies: count});
}


exports.get_by_id = async function (req, res) {

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const part = await ProductSupply.findById(req.params.id).populate(PRODUCT_SUPPLY_POPULATOR);
    if (!part) return res.status(404).send(API_RESPONSE(false, "Part not found", null, 400));

    return res.status(200).send(part);
}

exports.get_all_by_supplier = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const supplier = await Supplier.findOne({_id: req.params.id, status: SUPPLIER_STATUS_ENUM.ACTIVE});
    if (!supplier) return res.status(404).send(API_RESPONSE(false, "Supplier not found", null, 400));

    const parts = await ProductSupply.find({supplier: req.params.id}).populate(PRODUCT_SUPPLY_POPULATOR);

    return res.status(200).send(parts);
}

exports.get_all_by_receiver = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send('Invalid ObjectId');

    const employee = await Employee.findOne({_id: req.params.id, status: EMPLOYEE_STATUS_ENUM.ACTIVE});
    if (!employee) return res.status(404).send(API_RESPONSE(false, "Receiver not found", null, 400));

    const parts = await ProductSupply.find({reciever: req.params.id}).populate(PRODUCT_SUPPLY_POPULATOR);
    if (!parts) return res.status(404).send(API_RESPONSE(false, "Part not found", null, 400));

    return res.status(200).send(parts);
}


exports.create = async function (req, res) {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const supplier = await Supplier.findOne({
        _id: req.body.supplier,
        status: SUPPLIER_STATUS_ENUM.ACTIVE
    }).populate("user");
    if (!supplier) return res.status(404).send(API_RESPONSE(false, "Supplier not found", null, 400));

    const user = await User.findOne({
        _id: req.body.reciever,
        status: USER_STATUS_ENUM.ACTIVE
    }).populate("user");
    if (!user) return res.status(404).send(API_RESPONSE(false, "Receiver not found", null, 400));

    const TODAY = new Date();
    req.body.month = TODAY.getUTCMonth();
    req.body.year = TODAY.getUTCFullYear();
    req.body.day = TODAY.getUTCDate();
    const weekMappings = getWeekOfMonth(req.body.year, req.body.month);
    req.body.week = getWeekRange(weekMappings, req.body.day);

    const entity = new ProductSupply(req.body);

    const saved = await entity.save();
    if (!saved) return res.status(500).send(API_RESPONSE(false, "ProductSupply not saved", null, 400));

    const message = "Congrats ... 🎉🎉🎉 You have supplied some products successfully.";

    await notifyMany(await getAllAdmins(), saved._id, NOTIFICATION_TYPE_ENUM.SUPPLY, message)
    // await notifyMany(await getAllSalesManagers(), saved._id, NOTIFICATION_TYPE_ENUM.SUPPLY, message)
    return res.status(201).send(saved);
}

exports.update = async function (req, res) {
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const supplier = await Supplier.findOne({_id: req.body.supplier, status: SUPPLIER_STATUS_ENUM.ACTIVE});
    if (!supplier) return res.status(404).send(API_RESPONSE(false, "Supplier not found", null, 400));

    const employee = await Employee.findOne({_id: req.body.reciever, status: EMPLOYEE_STATUS_ENUM.ACTIVE});
    if (!employee) return res.status(404).send(API_RESPONSE(false, "Receiver not found", null, 400));

    const supplied_parts = await SuppliedProduct.find({part_supply: req.params.id, active: true});

    let total_quantity = supplied_parts.map(item => item.quantity).reduce((prev, next) => prev + next);
    req.body.supply_price = supplied_parts.map(item => item.supply_price).reduce((prev, next) => prev + next);
    req.body.supply_quantity = total_quantity;

    const updated = await ProductSupply.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true}
    );
    if (!updated) return res.status(500).send(API_RESPONSE(false, "Part not updated", null, 400));
    return res.status(200).send(updated);
}

exports.delete = async function (req, res) {
    const supply = await ProductSupply.findById(req.params.id);
    if (!supply) return res.status(404).send(API_RESPONSE(false, "Supply not found", null, 400));

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    const suppliedPartDependency = await dependencyChecker(SuppliedProduct, 'part_supply', req.params.id);
    if (suppliedPartDependency) return res.status(200).send(API_RESPONSE(false, 'Document cannot be deleted\nIt Has dependencies', null, 400));

    const deleted = await ProductSupply.findByIdAndUpdate(req.params.id, {active: false}, {new: true});
    if (!deleted)
        return res.status(500).send(API_RESPONSE(false, "PartSupply not deleted", null, 400));


    let loggedInUser = await User.findById(req.AUTH_DATA.USER_ID)
    const message = loggedInUser.firstName + " " + loggedInUser.lastName + " deleted a supply ";

    await notifyMany(await getAllAdmins(), deleted._id, NOTIFICATION_TYPE_ENUM.SUPPLY_DELETION, message)

    return res.status(200).send(API_RESPONSE(false, "PartSupply deleted", null, 400));
}

