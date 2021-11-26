const {
    AppliedDiscount,
    validateAppliedDiscount
} = require("../../../models/Discount/applied-discount.model");
const {API_RESPONSE, getDuration} = require("../../../utils/common");
const {ProductOnMarket} = require("../../../models/Market/product-on-market.model");
const {OrderDiscount, getDiscountAvailability} = require("../../../models/Discount/order-discount.model");
const {
    ORDER_DISCOUNT_STATUS_ENUM,
    ORDER_STATUS_ENUM,
    ORDER_DISCOUNT_SCOPE_ENUM,
    CUSTOMER_STATUS_ENUM, APPLIED_DISCOUNT_STATUS_ENUM, ORDER_DISCOUNT_TYPE_ENUM, NOTIFICATION_TYPE_ENUM
} = require("../../../utils/enumerations/constants");
const {Order} = require("../../../models/Order/order.model");
const {Customer} = require("../../../models/Customer/customer.model");
const {notifyMany} = require("../User/notifications.controller");
const {getAllAdmins} = require("../../../models/User/user.model");


const POPULATOR = {
    path: 'order_discount customer'
}


exports.get_all = async function (req, res) {
    let entities = await AppliedDiscount.find().populate(POPULATOR);
    return res.send(entities)
}


exports.get_all_by_order_discount = async function (req, res) {
    let entities = await AppliedDiscount.find({order_discount: req.params.id}).populate(POPULATOR);
    return res.send(entities)
}


exports.get_by_id = async function (req, res) {
    let entity = await AppliedDiscount.findById(req.params.id).populate(POPULATOR);
    if (!entity) return res.status(404).send(API_RESPONSE(false, "AppliedCouponCode with this id does not exist", null, 404))
    return res.send(entity)
}


exports.create = async function (req, res) {
    let {error} = validateAppliedDiscount(req.body)
    if (error) return res.status(400).send(API_RESPONSE(false, error.details[0].message, null, 400));

    let discount = await OrderDiscount.findOne({
        _id: req.body.order_discount,
        active: true,
        status: {$in: [ORDER_DISCOUNT_STATUS_ENUM.UNUSED, ORDER_DISCOUNT_STATUS_ENUM.ACTIVATED]}
    });
    if (!discount) return res.status(404).send(API_RESPONSE(false, "Order Discount does not exists", null, 404))

    if (discount.discount_type !== ORDER_DISCOUNT_TYPE_ENUM.PART_ORDER_BASED && discount.discount_type !== ORDER_DISCOUNT_TYPE_ENUM.BOTH)
        return res.status(400).send(API_RESPONSE(false, "This Discount is not applicable to part orders only for cars.", null, 400))

    let order = await Order.findOne({
        _id: req.body.order,
        status: {$in: [ORDER_STATUS_ENUM.INITIATED, ORDER_STATUS_ENUM.PAYING]}, active: true
    });
    if (!order) return res.status(404).send(API_RESPONSE(false, "Order does not exists", null, 404))


    const customer = await Customer.findOne({
        _id: req.body.customer,
        status: CUSTOMER_STATUS_ENUM.ACTIVE
    }).populate({path: "user"});
    if (!customer) return res.status(404).send(API_RESPONSE(false, "Requesting customer does not exist", null, 404));


    if (getDuration(discount.createdAt, discount.duration_type) > discount.duration) {
        discount.status = ORDER_DISCOUNT_STATUS_ENUM.DURATION_EXPIRED;
        discount.active = false;
        await discount.save();
        return res.status(403).send(API_RESPONSE(false, 'Sorry this Coupon code has expired.', null, 403));
    }

    if (discount.discount_scope === ORDER_DISCOUNT_SCOPE_ENUM.CUSTOMER_BASED && String(discount.customer) !== String(customer._id))
        return res.status(403).send(API_RESPONSE(false, 'Sorry The Coupon code does not belong to you.', null, 403));

    const duplicate = await AppliedDiscount.findOne({
        order_discount: discount._id,
        order: req.body.order,
        status: APPLIED_DISCOUNT_STATUS_ENUM.UNUSED
    });
    if (duplicate)
        return res.status(400).send(API_RESPONSE(false, 'Already Applied.', null, 403));


    if (await getDiscountAvailability(customer, discount) === "AVAILABLE") {
        const appliedCoupon = new AppliedDiscount(req.body);
        const saved = await appliedCoupon.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'AppliedCouponCode not saved', null, 400));

        const message = customer.user.firstName + " " + customer.user.lastName + " applied the discount whose coupon " + discount.coupon_code;
        await notifyMany(await getAllAdmins(), discount._id, NOTIFICATION_TYPE_ENUM.DISCOUNT_APPLIED, message);

        return res.status(201).send(saved);
    } else
        return res.status(400).send(API_RESPONSE(false, 'Sorry Discount not available for you.', null, 400));
}


exports.get_active_applied_discounts = async function (req, res) {
    let order = await Order.findOne({_id: req.params.id, active: true});
    if (!order) return res.status(200).send({available: false, object: order});


    const applied_discounts = await AppliedDiscount.find({
        order: req.params.id,
        status: {$in: [APPLIED_DISCOUNT_STATUS_ENUM.UNUSED, APPLIED_DISCOUNT_STATUS_ENUM.DELETED, ORDER_DISCOUNT_STATUS_ENUM.DURATION_EXPIRED]}
    }).populate(POPULATOR);

    const activeDiscounts = [];
    const inactiveDiscounts = [];

    const reasons = [];
    for (let applied_discount of applied_discounts) {
        if (applied_discount.status === APPLIED_DISCOUNT_STATUS_ENUM.UNUSED) {
            const order_discount = await OrderDiscount.findById(applied_discount.order_discount);
            let discount_duration = getDuration(order_discount.createdAt, order_discount.duration_type);
            if (discount_duration > order_discount.duration) {
                applied_discount.status = APPLIED_DISCOUNT_STATUS_ENUM.DURATION_EXPIRED;
                applied_discount.active = false;
                order_discount.status = ORDER_DISCOUNT_STATUS_ENUM.DURATION_EXPIRED;
                order_discount.active = false;
                reasons.push("EXPIRED")
                await applied_discount.save();
                await order_discount.save();
                inactiveDiscounts.push(applied_discount)
            } else {
                activeDiscounts.push(applied_discount);
            }
        } else if (applied_discount.status === APPLIED_DISCOUNT_STATUS_ENUM.DURATION_EXPIRED) {
            reasons.push("EXPIRED")
            inactiveDiscounts.push(applied_discount)
        } else {
            reasons.push("CANCELLED")
            inactiveDiscounts.push(applied_discount)
        }
    }

    if (activeDiscounts.length < 1)
        return res.status(200).send({available: false, reasons: reasons, object: inactiveDiscounts});
    else
        return res.status(200).send({available: true, reasons: [], object: activeDiscounts});

}


