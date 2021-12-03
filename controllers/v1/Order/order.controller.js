const {immutate} = require("../../../utils/common");
const {POPULATOR} = require("../../../models/Order/order.model");
const {
    ONE_DAY, NOTIFICATION_TYPE_ENUM, DATE,
    APPLIED_DISCOUNT_STATUS_ENUM
} = require("../../../utils/enumerations/constants");
const {getWeekRange} = require("../../../utils/common");
const {getWeekOfMonth} = require("../../../utils/common");
const {generateOrderCode} = require("../../../utils/common");

const {CUSTOMER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {ORDER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {OnlinePayment} = require("../../../models/Payment/online-payment.model");
const {
    ProductOrder,
    PRODUCT_ORDER_POPULATOR: PART_ORDER_POPULATOR,
    PRODUCT_ORDER_POPULATOR
} = require("../../../models/Order/product-order.model");
const {Order, validate, validateDeliveryLocation} = require("../../../models/Order/order.model");
const {Customer} = require("../../../models/Customer/customer.model");
const {DeliveryZone} = require('../../../models/DeliveryLocation/delivery-zones.model');

const {validObjectId, API_RESPONSE} = require('../../../utils/common');
const {notifyMany} = require("../User/notifications.controller");
const {getAllSalesManagers, getAllAdmins} = require("../../../models/User/user.model");
const {ProductOnMarket, PRODUCT_ON_MARKET_POPULATOR} = require("../../../models/Market/product-on-market.model");
const {Income} = require("../../../models/Reporting/income.model");
const {AppliedDiscount} = require("../../../models/Discount/applied-discount.model");


exports.get_all = async function (req, res) {
    const orders = await Order.find().sort({updatedAt: -1}).populate(POPULATOR);
    return res.status(200).send(orders);
}

exports.get_all_paginated = async function (req, res) {

    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: (page) || 1}
    const orders = await Order.paginate({active: true}, options);
    return res.status(200).send(orders);
}


exports.get_all_active = async function (req, res) {

    const {limit, page} = req.query;
    const options = {
        limit: limit || 30,
        populate: 'customer delivery_zone delivery_zone.region',
        sort: {updatedAt: -1},
        page: (page - 1) || 1
    }

    const orders = await Order.paginate({active: true}, options);
    return res.status(200).send(orders);
}

exports.get_passed_week = async function (req, res) {
    let orders = await Order.find({createdAt: {$gte: DATE.THIS_WEEK}}).populate(POPULATOR)
    return res.send(orders)
}


exports.get_all_by_status = async function (req, res) {
    if (!(ORDER_STATUS_ENUM.hasOwnProperty(req.params.status)))
        return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, {types: ORDER_STATUS_ENUM}))

    const orders = await Order.find({status: req.params.status}).sort({updatedAt: -1}).populate(POPULATOR);
    return res.status(200).send(orders);
}


exports.search = async function (req, res) {

    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const instances = await Order.find({code: {$regex: regex}}).sort({updatedAt: -1}).populate(POPULATOR);
    return res.status(200).send(instances);

}

exports.search_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: page || 1}

    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const instances = await Order.paginate({code: {$regex: regex}}, options);
    return res.status(200).send(instances);
}

exports.get_all_by_status_paginated = async function (req, res) {

    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: (page) || 1}

    if (!(ORDER_STATUS_ENUM.hasOwnProperty(req.params.status)))
        return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, {types: ORDER_STATUS_ENUM}))

    const orders = await Order.paginate({status: req.params.status}, options);
    return res.status(200).send(orders);
}

exports.get_statistics = async function (req, res) {

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const month = new Date(now.getFullYear(), now.getMonth());
    const year = new Date(now.getFullYear());
    const week = new Date(new Date() - 7 * 60 * 60 * 24 * 1000);

    const todayOrders = await Order.find({
        createdAt: {
            $gte: today
        }
    }).sort({updatedAt: -1}).populate('customer delivery_zone');

    const weekOrders = await Order.find({
        createdAt: {
            $gte: week
        }
    }).sort({updatedAt: -1}).populate('customer delivery_zone');

    const monthOrders = await Order.find({
        createdAt: {
            $gte: month
        }
    }).sort({updatedAt: -1}).populate('customer delivery_zone');

    const yearOrders = await Order.find({
        createdAt: {
            $gte: year
        }
    }).sort({updatedAt: -1}).populate('customer delivery_zone');


    const todayOrdersCount = await Order.find({
        createdAt: {
            $gte: today
        }
    }).countDocuments();

    const weekOrdersCount = await Order.find({
        createdAt: {
            $gte: week
        }
    }).countDocuments();

    const monthOrdersCount = await Order.find({
        createdAt: {
            $gte: month
        }
    }).countDocuments();

    const yearOrdersCount = await Order.find({
        createdAt: {
            $gte: year
        }
    }).countDocuments();

    const shippedOrdersCount = await Order.find({status: 'DELIVERED'}).countDocuments();
    const UnShippedOrdersCount = await Order.find({status: 'PAID'}).countDocuments();
    const UnPaidOrdersCount = await Order.find({status: 'PENDING'}).countDocuments();

    const orders = {
        today: todayOrders,
        currentWeek: weekOrders,
        currentMonth: monthOrders,
        currentYear: yearOrders,
    }

    const ordersCount = {
        todayTotalOrders: todayOrdersCount,
        currentWeekTotalOrders: weekOrdersCount,
        currentMonthTotalOrders: monthOrdersCount,
        currentYearTotalOrders: yearOrdersCount,
        totalShippedOrders: shippedOrdersCount,
        totalUnShippedOrders: UnShippedOrdersCount,
        totalUnPaidOrders: UnPaidOrdersCount,
    }

    return res.status(200).send({orders: orders, orderStatistics: ordersCount})
}

exports.get_by_id = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const order = await Order.findById(req.params.id).populate(POPULATOR);

    if (!order) return res.status(404).send(API_RESPONSE(false, 'An error occurred', null, 500));
    return res.status(200).send(order);
}


exports.get_details = async function (req, res) {

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

    let instance = await Order.findById(req.params.id).populate(POPULATOR);
    if (!instance) return res.status(404).send(API_RESPONSE(false, 'Discount not found', null, 400));

    instance = immutate(instance);


    if (instance.status === ORDER_STATUS_ENUM.PAYING) {

        const APPLIED_DISCOUNT_POPULATOR = {
            path: 'order_discount customer'
        }

        const applied_discounts = await AppliedDiscount.find({
            order: req.params.id,
            status: APPLIED_DISCOUNT_STATUS_ENUM.UNUSED
        }).populate(APPLIED_DISCOUNT_POPULATOR);


        instance.productOrders = await ProductOrder.find({
            active: true,
            order: instance._id
        }).select('-order').populate(PRODUCT_ORDER_POPULATOR);
        for (let productOrder of instance.productOrders) {
            for (let product of productOrder.products) {

            }
        }
        instance.applied_discounts = applied_discounts
        if (applied_discounts.length > 0)
            instance.discount_amount = instance.total_order_price * applied_discounts.map(item => item.order_discount.discount).reduce((prev, next) => prev + next)
        else
            instance.discount_amount = 0;

    } else if (instance.status === ORDER_STATUS_ENUM.PAID) {
        instance.productOrders = await ProductOrder.find({
            active: true,
            order: instance._id
        }).select('-order').populate(PRODUCT_ORDER_POPULATOR);

        instance.payments = await OnlinePayment.find({
            active: true,
            order: instance._id
        }).select('-order').populate('');

    } else if (instance.status === ORDER_STATUS_ENUM.SHIPPING) {
        instance.productOrders = await ProductOrder.find({
            active: true,
            order: instance._id
        }).select('-order').populate(PRODUCT_ORDER_POPULATOR);

        instance.payments = await OnlinePayment.find({
            active: true,
            order: instance._id
        }).select('-order').populate('');

    }
    return res.status(200).send(instance);
}

exports.get_all_by_customer = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 500));
    const orders = await Order.find({
        customer: req.params.id,
        active: true
    }).sort({updatedAt: -1}).populate(POPULATOR);
    return res.status(200).send(orders);
}

exports.get_all_by_customer_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: (page) || 1}

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 500));
    const orders = await Order.paginate({customer: req.params.id}, options);

    return res.status(200).send(orders);
}

exports.search_by_customer_paginated = async function (req, res) {
    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: page || 1}

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 500));

    const name = req.query.name;
    if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
    const regex = new RegExp(name, 'gi');

    const instances = await Order.paginate({code: {$regex: regex}, customer: req.params.id}, options);
    return res.status(200).send(instances);
}

exports.get_customer_statistics = async function (req, res) {

    if (!(validObjectId(req.params.id))) return res.status(400).send('Invalid ObjectId');

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('Customer not found');
    const ordersCount = await Order.find({customer: req.params.id}).countDocuments();
    const paymentsCount = await Order.find({customer: req.params.id, status: 'PAID'}).countDocuments();
    const unPaidCount = await Order.find({customer: req.params.id, status: 'PENDING'}).countDocuments();

    return res.status(200).send({
        totalOrders: ordersCount,
        totalPayments: paymentsCount,
        totalUnPaid: unPaidCount
    });
}

exports.create = async function (req, res) {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findOne({
        _id: req.body.customer,
        status: CUSTOMER_STATUS_ENUM.ACTIVE
    }).populate("user");

    if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 404));

    const zone = await DeliveryZone.findOne({_id: req.body.delivery_zone, active: true});
    if (!zone) return res.status(404).send(API_RESPONSE(false, 'DeliveryZone not found', null, 404));

    let code = null, existing = null;

    while (true) {
        code = generateOrderCode();
        existing = await Order.findOne({code: code});
        if (!existing)
            break;
    }

    req.body.code = code;

    const TODAY = new Date();
    req.body.month = TODAY.getUTCMonth();
    req.body.year = TODAY.getUTCFullYear();
    req.body.day = TODAY.getUTCDate();
    const weekMappings = getWeekOfMonth(req.body.year, req.body.month);
    req.body.week = getWeekRange(weekMappings, req.body.day);

    const date = new Date();
    date.setTime((date.getTime() + (ONE_DAY)));
    req.body.expiration_date = date;
    req.body.total_order_quantities = 0;
    req.body.total_order_price = 0;

    const order = new Order(req.body);

    const saved = await order.save();
    if (!saved) return res.status(500).send(API_RESPONSE(false, 'Order not saved', null, 500));

    const message = customer.user.firstName + " " + customer.user.lastName + " made an order."

    // await notifyMany(await getAllSalesManagers(), saved._id, NOTIFICATION_TYPE_ENUM.NEW_ORDER, message)
    await notifyMany(await getAllAdmins(), saved._id, NOTIFICATION_TYPE_ENUM.NEW_ORDER, message)

    return res.status(201).send(saved);

}

exports.get_delivery_location_details = async function (req, res) {

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const {error} = validateDeliveryLocation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const order = await Order.findOne({_id: req.params.id, active: true});
    if (!order) return res.status(404).send(API_RESPONSE(false, 'Order not found', null, 500));

    if (order.expiration_date < Date.now()) {
        order.status = ORDER_STATUS_ENUM.EXPIRED;
        return res.status(400).send(API_RESPONSE(false, 'Order has expired', null, 400))
    }

    const location = await DeliveryZone.findById(req.body.delivery_location);
    if (!location) return res.status(404).send(API_RESPONSE(false, 'Order not found', null, 500));

    order.delivery_location = req.body.delivery_location;
    order.expiration_date = order.expiration_date.setTime(order.expiration_date.getTime() + ONE_DAY);

    const saved = await order.save();
    if (!saved) return res.status(500).send(API_RESPONSE(false, 'Order not saved', null, 500));
    return res.status(201).send(saved);
}

exports.update = async function (req, res) {

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const order = await Order.findOne({_id: req.params.id, active: true});
    if (!order) return res.status(404).send(API_RESPONSE(false, 'Order not found', null, 500));

    if (order.expiration_date < Date.now()) {
        order.status = ORDER_STATUS_ENUM.EXPIRED;
        return res.status(400).send(API_RESPONSE(false, 'Order has expired', null, 400))
    }


    const customer = await Customer.findOne({_id: req.body.customer, status: CUSTOMER_STATUS_ENUM.ACTIVE});
    if (!customer) return res.status(404).send(API_RESPONSE(false, 'Customer not found', null, 404));

    const zone = await DeliveryZone.findOne({_id: req.body.delivery_zone, active: true});
    if (!zone) return res.status(404).send(API_RESPONSE(false, 'DeliveryZone not found', null, 404));

    req.body.expiration_date = order.expiration_date.setTime(order.expiration_date.getTime() + ONE_DAY);

    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {new: true});
    if (!updated) return res.status(500).send('Order not updated');
    return res.status(200).send(updated);
}

exports.change_status = async function (req, res) {

    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const order = await Order.findOne({_id: req.params.id, active: true});
    if (!order) return res.status(404).send(API_RESPONSE(false, 'Order not found', null, 500));

    if (req.params.status !== ORDER_STATUS_ENUM.ARCHIVED)
        return res.status(400).send(API_RESPONSE(false, 'Order status should be only archived', null, 500));

    if (!(ORDER_STATUS_ENUM.hasOwnProperty(req.params.status)))
        return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, {types: ORDER_STATUS_ENUM}));

    order.status = req.params.status;
    await order.save();


    let productOrders = await ProductOrder.find({order: order._id})
    for (const productOrder of productOrders) {
        // return items to part on markert
        for (const product of productOrder.products) {
            let productOnMarket = await ProductOnMarket.findById(product.product)
            productOnMarket.quantity += product.quantity
            await productOnMarket.save();
        }

        // delete the partorder
        productOrder.active = false
        await productOrder.save();

        const income = await Income.findOne({
            day: order.day,
            month: order.month,
            year: order.year
        });

        if (!income) {
            continue;
        }

        income.direct_purchase_sale.items -= order.total_order_quantities
        income.direct_purchase_sale.payments -= order.total_order_price
        let directPurchaseIncome = 0;
        for (const product of productOrder.products) {
            let productOnMarket = await ProductOnMarket.findById(productOrder.product).populate(PRODUCT_ON_MARKET_POPULATOR)
            if (productOnMarket) {
                let supplyPrice = productOnMarket.supplies[productOnMarket.supplies.length - 1].supplied_product.product_supply.supply_price;
                directPurchaseIncome += getTotalIncome(supplyPrice, product.quantity, product.discounted_price, (product.total_price / product.quantity))
            }
        }
        income.total_income -= directPurchaseIncome;
        await income.save();
    }

    return res.status(200).send(order);
}

exports.delete = async function (req, res) {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const order = await Order.findOne({_id: req.params.id, active: true});
    if (!order) return res.status(404).send(API_RESPONSE(false, 'Order not found', null, 500));

    let productOrders = await ProductOrder.find({order: order._id})
    for (const productOrder of productOrders) {
        // return items to part on markert
        for (const product of productOrder.products) {
            let productOnMarket = await ProductOnMarket.findById(product.product)
            productOnMarket.quantity += product.quantity
            await productOnMarket.save();
        }

        // delete the partorder
        productOrder.active = false
        await productOrder.save();

        const income = await Income.findOne({
            day: order.day,
            month: order.month,
            year: order.year
        });

        if (!income) {
            continue;
        }


        income.direct_purchase_sale.items -= order.total_order_quantities
        income.direct_purchase_sale.payments -= order.total_order_price
        let directPurchaseIncome = 0;
        for (const product of productOrder.products) {
            let productOnMarket = await ProductOnMarket.findById(productOrder.product).populate(PRODUCT_ON_MARKET_POPULATOR)
            if (productOnMarket) {
                let supplyPrice = productOnMarket.supplies[productOnMarket.supplies.length - 1].supplied_product.product_supply.supply_price;
                directPurchaseIncome += getTotalIncome(supplyPrice, product.quantity, product.discounted_price, (product.total_price / product.quantity))
            }
        }
        income.total_income -= directPurchaseIncome;
        await income.save();
    }

    let payments = await OnlinePayment.find({order: req.params.id, active: true})
    for (const payment of payments) {
        payment.active = false;
        await payment.save();
    }

    // let onlinePayments = await Payment.find({order: order._id, active: true})
    // for (const payment of onlinePayments) {
    //     payment.active = false;
    //     await payment.save();
    // }

    const deleted = await Order.findByIdAndUpdate(req.params.id, {active: false}, {new: true});
    if (!deleted) return res.status(500).send(API_RESPONSE(false, 'Order not updated', null, 500));
    return res.status(200).send(API_RESPONSE(true, 'Order deleted successfully', null, 200));
}
