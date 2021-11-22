const {PURCHASE_STATUS_ENUM} = require("../enumerations/constants");
const {DirectPurchaseFromMarket} = require("../../models/DirectPurchaseFromMarket/direct-purchase-from-market.model");
const {CashPayment} = require("../../models/Payment/cash-payment.model");
const {OnlinePayment} = require("../../models/Payment/online-payment.model");
const {PAYMENT_STATUS_ENUM} = require("../enumerations/constants");
const {DATE} = require("../enumerations/constants");
const {ORDER_STATUS_ENUM} = require("../enumerations/constants");
const {Order} = require("../../models/Order/order.model");
const {WEEKDAYS} = require("../enumerations/constants");
const {getWeekRange} = require("../common");
const {getWeekOfMonth} = require("../common");
const {SuppliedPart: SuppliedProduct} = require("../../models/Supply/supplied-products.model");
const {PartSupply: ProductSupply} = require("../../models/Supply/product-supply.model");

exports.getAllSuppliesStatistics = async () => {
    const supplies = await ProductSupply.find({active: true});
    let totalSuppliedParts = 0;
    for (const supply of supplies) {
        const parts = await SuppliedProduct.findOne({part_supply: supply._id, active: true}).countDocuments();
        totalSuppliedParts += parts;
    }

    return {
        supplies: supplies.length,
        parts: totalSuppliedParts
    };
}


exports.getWeekSuppliesStatisticsPerDay = async (current = true) => {
    const TODAY = new Date();
    const CURRENT_MONTH = TODAY.getUTCMonth();
    const CURRENT_YEAR = TODAY.getUTCFullYear();
    const CURRENT_DAY = TODAY.getUTCDate();
    const weekMappings = getWeekOfMonth(CURRENT_YEAR, CURRENT_MONTH);

    const CURRENT_WEEK = getWeekRange(weekMappings, CURRENT_DAY);

    const supplies = await ProductSupply.find(
        {
            year: CURRENT_YEAR,
            month: CURRENT_MONTH,
            week: (current) ? (CURRENT_WEEK) : (CURRENT_WEEK - 1),
            active: true
        });


    const days = [
        {day: WEEKDAYS[0], stats: {supplies: 0, parts: 0}},
        {day: WEEKDAYS[1], stats: {supplies: 0, parts: 0}},
        {day: WEEKDAYS[2], stats: {supplies: 0, parts: 0}},
        {day: WEEKDAYS[3], stats: {supplies: 0, parts: 0}},
        {day: WEEKDAYS[4], stats: {supplies: 0, parts: 0}},
        {day: WEEKDAYS[5], stats: {supplies: 0, parts: 0}},
        {day: WEEKDAYS[6], stats: {supplies: 0, parts: 0}},
    ];

    for (const supply of supplies) {
        const WEEKDAY = WEEKDAYS[supply.day];
        const mapping = days.find(elem => elem.day === WEEKDAY);
        if (mapping) {
            mapping.stats.supplies += 1;

            for (const supply of supplies) {
                const parts = await SuppliedProduct.findOne({part_supply: supply._id, active: true}).countDocuments();
                mapping.stats.parts += parts;
            }
        }
    }
    return days;
}


exports.getAllPaymentStatistics = async () => {

    const general = {
        initiated: 0,
        pending: 0,
        paid: 0,
        cancelled: 0,
        failed: 0,
        approved: 0,
        successfull: 0,
        total: 0
    };
    const mtnMomo = {
        initiated: 0,
        pending: 0,
        paid: 0,
        cancelled: 0,
        failed: 0,
        approved: 0,
        successfull: 0,
        total: 0
    };
    const card = {initiated: 0, pending: 0, paid: 0, cancelled: 0, failed: 0, approved: 0, successfull: 0, total: 0};
    const directCash = {pending: 0, paid: 0, successfull: 0, total: 0};

    const orders = await Order.find({active: true});

    for (const order of orders) {
        mtnMomo.initiated += await OnlinePayment.find({
            order: order._id,
            status: PAYMENT_STATUS_ENUM.INITIATED,
            active: true
        }).countDocuments();
        mtnMomo.pending += await OnlinePayment.find({
            order: order._id,
            status: PAYMENT_STATUS_ENUM.PENDING,
            active: true
        }).countDocuments();
        mtnMomo.paid += await OnlinePayment.find({
            order: order._id,
            status: PAYMENT_STATUS_ENUM.PAID,
            active: true
        }).countDocuments();
        mtnMomo.cancelled += await OnlinePayment.find({
            order: order._id,
            status: PAYMENT_STATUS_ENUM.CANCELLED,
            active: true
        }).countDocuments();
        mtnMomo.failed += await OnlinePayment.find({
            order: order._id,
            status: PAYMENT_STATUS_ENUM.FAILED,
            active: true
        }).countDocuments();
        mtnMomo.approved += await OnlinePayment.find({
            order: order._id,
            status: PAYMENT_STATUS_ENUM.APPROVED,
            active: true
        }).countDocuments();
        mtnMomo.total += await OnlinePayment.find({order: order._id, active: true}).countDocuments();
        mtnMomo.successfull += (mtnMomo.total - mtnMomo.failed);


        // card.initiated = await CardPayment.find({
        //     order: order._id,
        //     status: PAYMENT_STATUS_ENUM.INITIATED,
        //     active: true
        // }).countDocuments();
        // card.pending = await CardPayment.find({
        //     order: order._id,
        //     status: PAYMENT_STATUS_ENUM.PENDING,
        //     active: true
        // }).countDocuments();
        // card.paid = await CardPayment.find({
        //     order: order._id,
        //     status: PAYMENT_STATUS_ENUM.PAID,
        //     active: true
        // }).countDocuments();
        // card.cancelled = await CardPayment.find({
        //     order: order._id,
        //     status: PAYMENT_STATUS_ENUM.CANCELLED,
        //     active: true
        // }).countDocuments();
        // card.failed = await CardPayment.find({
        //     order: order._id,
        //     status: PAYMENT_STATUS_ENUM.FAILED,
        //     active: true
        // }).countDocuments();
        // card.approved = await CardPayment.find({
        //     order: order._id,
        //     status: PAYMENT_STATUS_ENUM.APPROVED,
        //     active: true
        // }).countDocuments();
        // card.total = await CardPayment.find({ order: order._id, active: true }).countDocuments();
        // card.successfull = (card.total - card.failed);


        general.initiated += (mtnMomo.initiated + card.initiated);
        general.pending += (mtnMomo.pending + card.pending);
        general.paid += (mtnMomo.paid + card.paid);
        general.cancelled += (mtnMomo.cancelled + card.cancelled);
        general.failed += (mtnMomo.failed + card.failed);
        general.approved += (mtnMomo.approved + card.approved);
        general.total += (mtnMomo.total + card.total);
        general.successfull += (mtnMomo.successfull + card.successfull);

    }

    const directPurchases = await DirectPurchaseFromMarket.find({active: true});

    for (const directPurchase of directPurchases) {
        // directCash.paid += await CashPayment.find({
        //     direct_purchase: directPurchase._id,
        //     status: PURCHASE_STATUS_ENUM.PAID,
        //     active: true
        // }).countDocuments();
        // directCash.pending += await CashPayment.find({
        //     direct_purchase: directPurchase._id,
        //     status: PURCHASE_STATUS_ENUM.PENDING,
        //     active: true
        // }).countDocuments();
        // directCash.total += await CashPayment.find({
        //     direct_purchase: directPurchase._id,
        //     active: true
        // }).countDocuments();
        // directCash.successfull += (directCash.total - directCash.pending);
    }

    return {general, mtnMomo, card, directCash}
}


exports.getAllPaymentAmounts = async () => {

    const general = {orderPrices: 0, discount: 0, shipping: 0, total: 0};
    const mtnMomo = {orderPrices: 0, discount: 0, shipping: 0, total: 0};
    const card = {orderPrices: 0, discount: 0, shipping: 0, total: 0};
    const directCash = {total: 0};

    let payments;

    const orders = await Order.find({active: true});

    for (const order of orders) {
        payments = await OnlinePayment.find({order: order._id, status: PAYMENT_STATUS_ENUM.INITIATED, active: true});
        for (const payment of payments) {
            mtnMomo.total += payment.amountToPay;
            mtnMomo.discount += payment.discount_amount;
            mtnMomo.orderPrices += payment.total_order_amount;
            mtnMomo.shipping += payment.shipping_amount;

        }
        payments = []
        // payments = await CardPayment.find({ order: order._id, status: PAYMENT_STATUS_ENUM.INITIATED, active: true });
        // for (const payment of payments) {
        //     card.total += payment.amountToPay;
        //     card.discount += payment.discount_amount;
        //     card.orderPrices += payment.total_order_amount;
        //     card.shipping += payment.shipping_amount;
        // }
        //
        general.total = mtnMomo.total + card.total;
        general.discount = mtnMomo.discount + card.discount;
        general.orderPrices = mtnMomo.orderPrices + card.orderPrices;
        general.shipping = mtnMomo.shipping + card.shipping;

    }

    const directPurchases = await DirectPurchaseFromMarket.find({active: true});


    for (const directPurchase of directPurchases) {
        const payments = await CashPayment.find({
            direct_purchase: directPurchase._id,
            status: PURCHASE_STATUS_ENUM.PAID,
            active: true
        });


        for (const payment of payments) {
            directPurchase.total += payment.amountPaid;
        }

    }
    return {general, mtnMomo, card, directCash}
}


exports.getWeekOrdersStatisticsPerDay = async (current = true) => {
    const TODAY = new Date();
    const CURRENT_MONTH = TODAY.getUTCMonth();
    const CURRENT_YEAR = TODAY.getUTCFullYear();
    const CURRENT_DAY = TODAY.getUTCDate();
    const weekMappings = getWeekOfMonth(CURRENT_YEAR, CURRENT_MONTH);

    const CURRENT_WEEK = getWeekRange(weekMappings, CURRENT_DAY);

    const orders = await Order.find(
        {
            year: CURRENT_YEAR,
            month: CURRENT_MONTH,
            week: (current) ? (CURRENT_WEEK) : (CURRENT_WEEK - 1),
            active: true
        });


    const days = [
        {day: WEEKDAYS[0], stats: {initiated: 0, paid: 0, delivered: 0, failed: 0, total: 0}},
        {day: WEEKDAYS[1], stats: {initiated: 0, paid: 0, delivered: 0, failed: 0, total: 0}},
        {day: WEEKDAYS[2], stats: {initiated: 0, paid: 0, delivered: 0, failed: 0, total: 0}},
        {day: WEEKDAYS[3], stats: {initiated: 0, paid: 0, delivered: 0, failed: 0, total: 0}},
        {day: WEEKDAYS[4], stats: {initiated: 0, paid: 0, delivered: 0, failed: 0, total: 0}},
        {day: WEEKDAYS[5], stats: {initiated: 0, paid: 0, delivered: 0, failed: 0, total: 0}},
        {day: WEEKDAYS[6], stats: {initiated: 0, paid: 0, delivered: 0, failed: 0, total: 0}},
    ];


    for (const order of orders) {
        const WEEKDAY = WEEKDAYS[order.day];
        const mapping = days.find(elem => elem.day === WEEKDAY);

        if (mapping) {
            mapping.stats.total += 1;

            switch (order.status) {
                case ORDER_STATUS_ENUM.INITIATED:
                    mapping.stats.initiated += 1;
                    break;
                case ORDER_STATUS_ENUM.PAID:
                    mapping.stats.paid += 1;
                    break;
                case ORDER_STATUS_ENUM.DELIVERED:
                    mapping.stats.delivered += 1;
                    break;
                case ORDER_STATUS_ENUM.FAILED:
                    mapping.stats.failed += 1;
                    break;

                default:
                    break;
            }
        }

    }
    return days;
}


exports.getAllOrderStatistics = async (timeframe = 'NONE') => {
    if (timeframe === 'NONE') {
        const initiated = await Order.find({status: ORDER_STATUS_ENUM.INITIATED, active: true}).countDocuments();
        const paid = await Order.find({status: ORDER_STATUS_ENUM.PAID, active: true}).countDocuments();
        const delivered = await Order.find({status: ORDER_STATUS_ENUM.DELIVERED, active: true}).countDocuments();
        const failed = await Order.find({status: ORDER_STATUS_ENUM.FAILED, active: true}).countDocuments();

        const total = await Order.find({active: true}).countDocuments();
        const undelivered = total - delivered;
        const unpaid = total - paid;
        const successfull = total - failed;

        return {
            initiated,
            paid,
            unpaid,
            delivered,
            undelivered,
            failed,
            successfull,
            total
        };
    } else if (timeframe === 'TODAY') {
        const initiated = await Order.find({
            status: ORDER_STATUS_ENUM.INITIATED,
            createdAt: {$gte: DATE.TODAY}, active: true
        }).countDocuments();
        const paid = await Order.find({
            status: ORDER_STATUS_ENUM.PAID,
            createdAt: {$gte: DATE.TODAY}, active: true
        }).countDocuments();
        const delivered = await Order.find({
            status: ORDER_STATUS_ENUM.DELIVERED,
            createdAt: {$gte: DATE.TODAY}, active: true
        }).countDocuments();
        const failed = await Order.find({
            status: ORDER_STATUS_ENUM.FAILED,
            createdAt: {$gte: DATE.TODAY}, active: true
        }).countDocuments();

        const total = await Order.find({createdAt: {$gte: DATE.TODAY}, active: true}).countDocuments();
        const undelivered = total - delivered;
        const unpaid = total - paid;
        const successfull = total - failed;

        return {
            initiated,
            paid,
            unpaid,
            delivered,
            undelivered,
            failed,
            successfull,
            total
        };
    } else if (timeframe === 'THIS_WEEK') {
        const initiated = await Order.find({
            status: ORDER_STATUS_ENUM.INITIATED,
            createdAt: {$gte: DATE.THIS_WEEK},
            active: true
        }).countDocuments();
        const paid = await Order.find({
            status: ORDER_STATUS_ENUM.PAID,
            createdAt: {$gte: DATE.THIS_WEEK},
            active: true
        }).countDocuments();
        const delivered = await Order.find({
            status: ORDER_STATUS_ENUM.DELIVERED,
            createdAt: {$gte: DATE.THIS_WEEK},
            active: true
        }).countDocuments();
        const failed = await Order.find({
            status: ORDER_STATUS_ENUM.FAILED,
            createdAt: {$gte: DATE.THIS_WEEK},
            active: true
        }).countDocuments();

        const total = await Order.find({createdAt: {$gte: DATE.THIS_WEEK}, active: true}).countDocuments();
        const undelivered = total - delivered;
        const unpaid = total - paid;
        const successfull = total - failed;

        return {
            initiated,
            paid,
            unpaid,
            delivered,
            undelivered,
            failed,
            successfull,
            total
        };
    } else if (timeframe === 'THIS_MONTH') {
        const initiated = await Order.find({
            status: ORDER_STATUS_ENUM.INITIATED,
            createdAt: {$gte: DATE.THIS_MONTH},
            active: true
        }).countDocuments();
        const paid = await Order.find({
            status: ORDER_STATUS_ENUM.PAID,
            createdAt: {$gte: DATE.THIS_MONTH},
            active: true
        }).countDocuments();
        const delivered = await Order.find({
            status: ORDER_STATUS_ENUM.DELIVERED,
            createdAt: {$gte: DATE.THIS_MONTH},
            active: true
        }).countDocuments();
        const failed = await Order.find({
            status: ORDER_STATUS_ENUM.FAILED,
            createdAt: {$gte: DATE.THIS_MONTH},
            active: true
        }).countDocuments();

        const total = await Order.find({createdAt: {$gte: DATE.THIS_MONTH}, active: true}).countDocuments();
        const undelivered = total - delivered;
        const unpaid = total - paid;
        const successfull = total - failed;

        return {
            initiated,
            paid,
            unpaid,
            delivered,
            undelivered,
            failed,
            successfull,
            total
        };
    } else if (timeframe === 'THIS_YEAR') {
        const initiated = await Order.find({
            status: ORDER_STATUS_ENUM.INITIATED,
            createdAt: {$gte: DATE.THIS_YEAR},
            active: true
        }).countDocuments();
        const paid = await Order.find({
            status: ORDER_STATUS_ENUM.PAID,
            createdAt: {$gte: DATE.THIS_YEAR},
            active: true
        }).countDocuments();
        const delivered = await Order.find({
            status: ORDER_STATUS_ENUM.DELIVERED,
            createdAt: {$gte: DATE.THIS_YEAR},
            active: true
        }).countDocuments();
        const failed = await Order.find({
            status: ORDER_STATUS_ENUM.FAILED,
            createdAt: {$gte: DATE.THIS_YEAR},
            active: true
        }).countDocuments();

        const total = await Order.find({createdAt: {$gte: DATE.THIS_YEAR}, active: true}).countDocuments();
        const undelivered = total - delivered;
        const unpaid = total - paid;
        const successfull = total - failed;

        return {
            initiated,
            paid,
            unpaid,
            delivered,
            undelivered,
            failed,
            successfull,
            total
        };
    }

}