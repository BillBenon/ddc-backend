const {PURCHASE_STATUS_ENUM} = require("../enumerations/constants");
const {DirectPurchaseFromMarket} = require("../../models/DirectPurchaseFromMarket/direct-purchase-from-market.model");
const {CashPayment} = require("../../models/Payment/cash-payment.model");
const {PAYMENT_STATUS_ENUM} = require("../enumerations/constants");
const {MTNMomoPayment: OnlinePayment} = require("../../models/Payment/online-payment.model");
const {ORDER_STATUS_ENUM} = require("../enumerations/constants");
const {Order} = require("../../models/Order/order.model");


exports.getCustomerOrderStatistics = async (customer) => {
    const initiated = await Order.find({
        customer: customer,
        status: ORDER_STATUS_ENUM.INITIATED,
        active: true
    }).countDocuments();
    const paid = await Order.find({
        customer: customer,
        status: ORDER_STATUS_ENUM.PAID,
        active: true
    }).countDocuments();
    const delivered = await Order.find({
        customer: customer,
        status: ORDER_STATUS_ENUM.DELIVERED,
        active: true
    }).countDocuments();
    const failed = await Order.find({
        customer: customer,
        status: ORDER_STATUS_ENUM.FAILED,
        active: true
    }).countDocuments();

    const total = await Order.find({customer: customer, active: true}).countDocuments();
    const undelivered = total - delivered;
    const unpaid = total - paid;
    const successfull = total - failed;

    const deliveryPercentage = (delivered / successfull) * 100;
    return {initiated, paid, unpaid, delivered, undelivered, failed, successfull, total, deliveryPercentage};
}


exports.getCustomerPaymentStatistics = async (customer) => {

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
    const directCash = {
        initiated: 0,
        pending: 0,
        paid: 0,
        cancelled: 0,
        failed: 0,
        approved: 0,
        successfull: 0,
        total: 0
    };

    const orders = await Order.find({customer: customer});

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




        // card.cancelled += await CardPayment.find({
        //     order: order._id,
        //     status: PAYMENT_STATUS_ENUM.CANCELLED,
        //     active: true
        // }).countDocuments();
        // card.failed += await CardPayment.find({
        //     order: order._id,
        //     status: PAYMENT_STATUS_ENUM.FAILED,
        //     active: true
        // }).countDocuments();
        // card.approved += await CardPayment.find({
        //     order: order._id,
        //     status: PAYMENT_STATUS_ENUM.APPROVED,
        //     active: true
        // }).countDocuments();
        // card.total += await CardPayment.find({order: order._id, active: true}).countDocuments();
        //
        // card.successfull += (card.total - card.failed);


        general.pending += (card.pending + mtnMomo.pending);
        general.initiated += (card.initiated + mtnMomo.initiated);
        general.paid += (card.initiated + mtnMomo.paid);
        general.cancelled += (card.cancelled + mtnMomo.cancelled);
        general.failed += (card.failed + mtnMomo.failed);
        general.approved += (card.approved + mtnMomo.approved);
        general.successfull += (card.successfull + mtnMomo.successfull);
        general.total += (card.total + mtnMomo.total);

    }

    const directPurchases = await DirectPurchaseFromMarket.find({customer: customer});


    for (const directPurchase of directPurchases) {
        directCash.paid += await CashPayment.find({
            direct_purchase: directPurchase._id,
            status: PURCHASE_STATUS_ENUM.PAID,
            active: true
        }).countDocuments();
        directCash.pending += await CashPayment.find({
            direct_purchase: directPurchase._id,
            status: PURCHASE_STATUS_ENUM.PENDING,
            active: true
        }).countDocuments();
        directCash.total += await CashPayment.find({
            direct_purchase: directPurchase._id,
            active: true
        }).countDocuments();
        directCash.successfull += (directCash.total - directCash.pending);

    }
    return {general, mtnMomo, card, directCash}
}


exports.getCustomerPaymentAmounts = async (customer) => {


    let payments;


    const general = {orderPrices: 0, discount: 0, shipping: 0, total: 0};
    const mtnMomo = {orderPrices: 0, discount: 0, shipping: 0, total: 0};
    const card = {orderPrices: 0, discount: 0, shipping: 0, total: 0};
    const directCash = {orderPrices: 0, discount: 0, shipping: 0, total: 0};


    const orders = await Order.find({customer: customer});

    for (const order of orders) {
        payments = await OnlinePayment.find({order: order._id, status: PAYMENT_STATUS_ENUM.INITIATED, active: true});
        for (const payment of payments) {
            mtnMomo.total += payment.amountToPay;
            mtnMomo.discount += payment.discount_amount;
            mtnMomo.orderPrices += payment.total_order_amount;
            mtnMomo.shipping += payment.shipping_amount;
        }
        //
        // payments = await CardPayment.find({order: order._id, status: PAYMENT_STATUS_ENUM.INITIATED, active: true});
        // for (const payment of payments) {
        //
        //     card.total += payment.amountToPay;
        //     card.discount += payment.discount_amount;
        //     card.orderPrices += payment.total_order_amount;
        //     card.shipping += payment.shipping_amount;
        // }

        general.total = card.total + mtnMomo.total;
        general.discount = card.discount + mtnMomo.discount;
        general.shipping = card.shipping + mtnMomo.shipping;
        general.orderPrices = card.orderPrices + mtnMomo.orderPrices;
    }
    const directPurchases = await DirectPurchaseFromMarket.find({customer: customer, active: true});


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


