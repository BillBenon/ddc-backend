const {PAYMENT_STATUS_ENUM} = require('../enumerations/constants');
const {AXIOS_REQUEST} = require('../../config/axios.config')

const {OnlinePayment, handleDiscountOnSave} = require("../../models/Payment/online-payment.model");
const {generateRandomUUID} = require('./methods');
const {generateCode} = require('../common');
const {notifyMany} = require("../../controllers/v1/User/notifications.controller");
const {getAllSalesManagers, getAllAdmins} = require("../../models/User/user.model");
const {NOTIFICATION_TYPE_ENUM, ORDER_STATUS_ENUM} = require("../../utils/enumerations/constants");
const {Order} = require("../../models/Order/order.model");
const {API_RESPONSE} = require("../../utils/common");
// const {notify} = require("../controllers/v1/User/notifications.controller");


const generateAPITOKEN = async () => {
    const credents = {
        username: process.env.API_USER,
        password: process.env.API_KEY
    };

    let encoded = credents.username + ":" + credents.password;
    encoded = Buffer.from(encoded).toString('base64');

    const headers = {
        'Authorization': ('Basic ' + encoded),
        'Content-Length': 0
    };


    try {
        const res = await AXIOS_REQUEST.post('/collection/token', null, {headers});
        return res.data;
    } catch (e) {
        return null;
    }
};


exports.initiateMomoTransaction = async (payment, found_discounts) => {

    payment.status = PAYMENT_STATUS_ENUM.PENDING;
    // await payment.save();

    // const {access_token} = await generateAPITOKEN();

    const randomUUID = generateRandomUUID();
    // const headers = {
    //     'Authorization': ('Bearer ' + access_token),
    //     'X-Target-Environment': 'sandbox',
    //     'X-Reference-Id': randomUUID,
    //     // 'X-Callback-Url': 'http://localhost:4008/api/v1/payments/mtn-momo/callback-url'
    // };

    let code = generateCode();

    while (true) {
        const existing = await OnlinePayment.findOne({transactionId: code});
        if (existing) code = generateCode();
        else break;
    }


    const body = {
        amount: payment.amountPaid.toString(),
        currency: payment.currency,
        externalId: code,
        payer: {
            partyIdType: "MSISDN",
            partyId: payment.msisdn
        },
        payerMessage: `Confirm payment on order ${payment.order}`,
        payeeNote: "Enter your MOMO PIN to checkout"
    };

    // try {
    //     await AXIOS_REQUEST.post('/collection/v1_0/requesttopay', body, { headers: headers });
    //
    //     payment.transactionReferenceId = randomUUID;
    //     payment.transactionId = code;
    //     payment.status = PAYMENT_STATUS_ENUM.PAID;
    //
    // } catch (e) {
    //     payment.transactionReferenceId = randomUUID;
    //     payment.transactionId = code;
    //     payment.status = PAYMENT_STATUS_ENUM.PAID;
    //
    //     // await payment.save();
    //     return null;
    // }
    //

    payment.transactionReferenceId = randomUUID;
    payment.transactionId = code;
    payment.status = PAYMENT_STATUS_ENUM.PAID;

    // const customer_message = " 👏 👏 👏  Your payment whose transaction Id " + randomUUID + " was successfully received your order is now in the process of shipping now";
    // await notify(entity.order.booking.customer.user, payment._id, NOTIFICATION_TYPE_ENUM.PAYMENT_RECEIVED, message)

    const saved_payment = await payment.save();

    if (saved_payment) {
        const message = "Part Order with payment transaction reference " + randomUUID + " is paid successfully through mobile money.";
        await notifyMany(await getAllSalesManagers(), payment._id, NOTIFICATION_TYPE_ENUM.PAID_PART_ORDER, message)
        await notifyMany(await getAllAdmins(), payment._id, NOTIFICATION_TYPE_ENUM.PAID_PART_ORDER, message)

        const order = await Order.findById(saved_payment.order);
        order.status = ORDER_STATUS_ENUM.PAID;
        await order.save();

        if (found_discounts.length > 0) {
            return await handleDiscountOnSave(saved_payment, found_discounts);
        }
    }
    return saved_payment;

};


exports.getMOMOPaymentStatus = async (payment) => {

    const {access_token} = await generateAPITOKEN();
    // const auth_token = auth.access_token;

    const headers = {
        'Authorization': ('Bearer ' + access_token),
        'X-Reference-Id': generateRandomUUID(),
        'X-Callback-Url': 'dsfadfs'
    };

    let code = generateCode();

    while (true) {
        const existing = await OnlinePayment.findOne({transactionId: code});
        if (existing) code = generateCode();
        else break;
    }

    const body = {
        amount: payment.amountPaid,
        currency: "EUR",
        externalId: code,
        payer: {
            partyIdType: "MSISDN",
            partyId: payment.msisdn
        },
        payerMessage: `Confirm payment on order ${payment.order}`,
        payeeNote: "Enter your MOMO PIN to checkout"
    };


    try {
        await AXIOS_REQUEST.post('/collection/v1_0/requesttopays', body, {headers});
    } catch (e) {
        return null;
    }
};
