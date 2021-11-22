const {SiteVisitor} = require("../../models/SiteVisitor/site-visitor.model");
const {range, genTimestamps} = require("../common");
const {PAYMENT_STATUS_ENUM, USER_STATUS_ENUM, CUSTOMER_STATUS_ENUM} = require("../enumerations/constants");
const {ProductSupply} = require("../../models/Supply/product-supply.model");
const {DirectPurchaseFromMarket} = require("../../models/DirectPurchaseFromMarket/direct-purchase-from-market.model");
const {OnlinePayment} = require("../../models/Payment/online-payment.model");
const {DATE} = require("../enumerations/constants");
const {Customer} = require("../../models/Customer/customer.model");
const {User} = require("../../models/User/user.model");
const {USER_CATEGORY_ENUM} = require("../enumerations/constants");
const {UserCategory} = require("../../models/User/category.model");

exports.getAllUsersStatistics = async () => {
    const supplierCategory = await UserCategory.findOne({name: USER_CATEGORY_ENUM.SUPPLIER});
    const employeeCategory = await UserCategory.findOne({name: USER_CATEGORY_ENUM.EMPLOYEE});

    const shipperCategory = await UserCategory.findOne({name: USER_CATEGORY_ENUM.SHIPPER});
    const customerCategory = await UserCategory.findOne({name: USER_CATEGORY_ENUM.CUSTOMER});

    const total = await User.find().countDocuments();
    const employees = await User.find({
        category: employeeCategory._id,
        status: USER_STATUS_ENUM.ACTIVE
    }).countDocuments();
    const suppliers = await User.find({
        category: supplierCategory._id,
        status: USER_STATUS_ENUM.ACTIVE
    }).countDocuments();
    const shippers = await User.find({
        category: shipperCategory._id,
        status: USER_STATUS_ENUM.ACTIVE
    }).countDocuments();
    const customers = await User.find({
        category: customerCategory._id,
        status: USER_STATUS_ENUM.ACTIVE
    }).countDocuments();

    return {total, employees, suppliers, shippers, customers};
}

exports.getAllCustomerStatistics = async (timeframe = 'NONE') => {
    if (timeframe === 'NONE') {
        const total = await Customer.find({status: CUSTOMER_STATUS_ENUM.ACTIVE}).countDocuments();
        return {total};
    } else if (timeframe === 'THIS_WEEK') {
        const total = await Customer.find({
            createdAt: {$gte: DATE.THIS_WEEK},
            status: CUSTOMER_STATUS_ENUM.ACTIVE
        }).countDocuments();
        return {total};
    } else if (timeframe === 'THIS_MONTH') {
        const total = await Customer.find({
            createdAt: {$gte: DATE.THIS_MONTH},
            status: CUSTOMER_STATUS_ENUM.ACTIVE
        }).countDocuments();
        return {total};
    } else if (timeframe === 'THIS_YEAR') {
        const total = await Customer.find({
            createdAt: {$gte: DATE.THIS_YEAR},
            status: CUSTOMER_STATUS_ENUM.ACTIVE
        }).countDocuments();
        return {total};
    }
}


exports.getIncomeStatistics = async (timeframe = 'NONE') => {
    if (timeframe === 'NONE') {
        const momoPayments = await OnlinePayment.aggregate([
            {
                $match: {active: true},
            }, {
                $group: {
                    _id: {status: PAYMENT_STATUS_ENUM.PAID},
                    totalAmount: {$sum: '$amountToPay'},
                    count: {$sum: 1}
                }
            }])
        // const cardPayments = await CardPayment.aggregate([
        //     {
        //         $match: {active: true},
        //     }, {
        //         $group: {
        //             _id: {status: PAYMENT_STATUS_ENUM.PAID},
        //             totalAmount: {$sum: '$amountToPay'},
        //             count: {$sum: 1}
        //         }
        //     }])
        const directPayments = await DirectPurchaseFromMarket.aggregate([
            {
                $group: {
                    _id: {status: PAYMENT_STATUS_ENUM.PAID},
                    totalAmount: {$sum: '$amountToPay'},
                    count: {$sum: 1}
                }
            }])
        const supplyPrices = await ProductSupply.aggregate([
            {
                $match: {active: true},
            },
            {
                $group: {
                    _id: {status: PAYMENT_STATUS_ENUM.PAID},
                    totalAmount: {$sum: '$supply_price'},
                    count: {$sum: 1}
                }
            }])


        let total = 0;
        if (momoPayments[0]) {
            total += momoPayments[0].totalAmount;
        }
        if (cardPayments[0]) {
            total += cardPayments[0].totalAmount;
        }
        if (directPayments[0]) {
            total += directPayments[0].totalAmount;
        }
        if (supplyPrices[0]) {
            total -= supplyPrices[0].totalAmount;
        }


        return {total};
    } else if (timeframe === 'THIS_WEEK') {
        const mapping = {days: range(1, 7), totals: range(1, 7, true)};

        let i = 0;
        for (const day of mapping.days) {

            const momoPayments = await OnlinePayment.aggregate([
                {$match: {createdAt: {$gte: DATE.THIS_WEEK}, day: day, active: true}},
                {
                    $group: {
                        _id: {status: PAYMENT_STATUS_ENUM.PAID},
                        totalAmount: {$sum: '$amountToPay'},
                        count: {$sum: 1}
                    }
                }])
            // const cardPayments = await CardPayment.aggregate([
            //     {$match: {createdAt: {$gte: DATE.THIS_WEEK}, day: day, active: true}},
            //     {
            //         $group: {
            //             _id: {status: PAYMENT_STATUS_ENUM.PAID},
            //             totalAmount: {$sum: '$amountToPay'},
            //             count: {$sum: 1}
            //         }
            //     }])
            const directPayments = await DirectPurchaseFromMarket.aggregate([
                {$match: {createdAt: {$gte: DATE.THIS_WEEK}, day: day}},
                {$group: {_id: '$active', totalAmount: {$sum: '$amountToPay'}, count: {$sum: 1}}}])
            const supplyPrices = await ProductSupply.aggregate([
                {$match: {createdAt: {$gte: DATE.THIS_WEEK}, day: day, active: true}},
                {$group: {_id: '$active', totalAmount: {$sum: '$supply_price'}, count: {$sum: 1}}}])


            if (momoPayments[0]) {
                mapping.totals[i] += momoPayments[0].totalAmount;
            }
            if (cardPayments[0]) {
                mapping.totals[i] += cardPayments[0].totalAmount;
            }
            if (directPayments[0]) {
                mapping.totals[i] += directPayments[0].totalAmount;
            }
            if (supplyPrices[0]) {
                mapping.totals[i] -= supplyPrices[0].totalAmount;
            }
            i++;
        }
        return mapping;
    } else if (timeframe === 'THIS_MONTH') {
        const mapping = {days: range(1, 31), totals: range(1, 31, true)};

        let i = 0;
        for (const day of mapping.days) {
            const momoPayments = await OnlinePayment.aggregate([
                {$match: {createdAt: {$gte: DATE.THIS_MONTH}, day: day, active: true}},
                {
                    $group: {
                        _id: {status: PAYMENT_STATUS_ENUM.PAID},
                        totalAmount: {$sum: '$amountToPay'},
                        count: {$sum: 1}
                    }
                }])
            // const cardPayments = await CardPayment.aggregate([
            //     {$match: {createdAt: {$gte: DATE.THIS_MONTH}, day: day, active: true}},
            //     {
            //         $group: {
            //             _id: {status: PAYMENT_STATUS_ENUM.PAID},
            //             totalAmount: {$sum: '$amountToPay'},
            //             count: {$sum: 1}
            //         }
            //     }])
            const directPayments = await DirectPurchaseFromMarket.aggregate([
                {$match: {createdAt: {$gte: DATE.THIS_MONTH}, day: day}},
                {$group: {_id: '$active', totalAmount: {$sum: '$amountToPay'}, count: {$sum: 1}}}]);

            const supplyPrices = await ProductSupply.aggregate([
                {$match: {createdAt: {$gte: DATE.THIS_MONTH}, day: day, active: true}},
                {$group: {_id: '$active', totalAmount: {$sum: '$supply_price'}, count: {$sum: 1}}}]);


            if (momoPayments[0]) {
                mapping.totals[i] += momoPayments[0].totalAmount;
            }
            if (cardPayments[0]) {
                mapping.totals[i] += cardPayments[0].totalAmount;
            }
            if (directPayments[0]) {
                mapping.totals[i] += directPayments[0].totalAmount;
            }
            if (supplyPrices[0]) {
                mapping.totals[i] -= supplyPrices[0].totalAmount;
            }
            i++;
        }
        return mapping;
    } else if (timeframe === 'THIS_YEAR') {
        const mapping = {months: range(1, 12), totals: range(1, 12, true)};

        let i = 0;
        for (const month of mapping.months) {
            const momoPayments = await OnlinePayment.aggregate([
                {$match: {createdAt: {$gte: DATE.THIS_YEAR}, month: month, active: true}},
                {
                    $group: {
                        _id: {status: PAYMENT_STATUS_ENUM.PAID},
                        totalAmount: {$sum: '$amountToPay'},
                        count: {$sum: 1}
                    }
                }])
            // const cardPayments = await CardPayment.aggregate([
            //     {$match: {createdAt: {$gte: DATE.THIS_YEAR}, month: month, active: true}},
            //     {
            //         $group: {
            //             _id: {status: PAYMENT_STATUS_ENUM.PAID},
            //             totalAmount: {$sum: '$amountToPay'},
            //             count: {$sum: 1}
            //         }
            //     }])
            const directPayments = await DirectPurchaseFromMarket.aggregate([
                {$match: {createdAt: {$gte: DATE.THIS_YEAR}, month: month}},
                {$group: {_id: '$active', totalAmount: {$sum: '$amountToPay'}, count: {$sum: 1}}}])
            const supplyPrices = await ProductSupply.aggregate([
                {$match: {createdAt: {$gte: DATE.THIS_YEAR}, month: month, active: true}},
                {$group: {_id: '$active', totalAmount: {$sum: '$supply_price'}, count: {$sum: 1}}}])

            if (momoPayments[0]) {
                mapping.totals[i] += momoPayments[0].totalAmount;
            }
            if (cardPayments[0]) {
                mapping.totals[i] += cardPayments[0].totalAmount;
            }
            if (directPayments[0]) {
                mapping.totals[i] += directPayments[0].totalAmount;
            }
            if (supplyPrices[0]) {
                mapping.totals[i] -= supplyPrices[0].totalAmount;
            }
            i++;
        }
        return mapping;
    }
}


exports.getIncomeStatisticsTotals = async (timeframe = 'NONE') => {
    if (timeframe === 'NONE') {
        const momoPayments = await OnlinePayment.aggregate([
            {$match: {active: true}}, {
                $group: {
                    _id: {status: PAYMENT_STATUS_ENUM.PAID},
                    totalAmount: {$sum: '$amountToPay'},
                    count: {$sum: 1}
                }
            }])
        // const cardPayments = await CardPayment.aggregate([{$match: {active: true}}, {
        //     $group: {
        //         _id: {status: PAYMENT_STATUS_ENUM.PAID},
        //         totalAmount: {$sum: '$amountToPay'},
        //         count: {$sum: 1}
        //     }
        // }])
        const directPayments = await DirectPurchaseFromMarket.aggregate([{
            $group: {
                _id: {status: PAYMENT_STATUS_ENUM.PAID},
                totalAmount: {$sum: '$amountToPay'},
                count: {$sum: 1}
            }
        }])
        const supplyPrices = await ProductSupply.aggregate([{$match: {active: true}}, {
            $group: {
                _id: {status: PAYMENT_STATUS_ENUM.PAID},
                totalAmount: {$sum: '$supply_price'},
                count: {$sum: 1}
            }
        }])


        let total = 0;
        if (momoPayments[0]) {
            total += momoPayments[0].totalAmount;
        }
        if (cardPayments[0]) {
            total += cardPayments[0].totalAmount;
        }
        if (directPayments[0]) {
            total += directPayments[0].totalAmount;
        }
        if (supplyPrices[0]) {
            total -= supplyPrices[0].totalAmount;
        }


        return total;
    } else if (timeframe === 'THIS_WEEK') {


        const momoPayments = await OnlinePayment.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_WEEK}, active: true}},
            {
                $group: {
                    _id: {status: PAYMENT_STATUS_ENUM.PAID},
                    totalAmount: {$sum: '$amountToPay'},
                    count: {$sum: 1}
                }
            }])
        // const cardPayments = await CardPayment.aggregate([
        //     {$match: {createdAt: {$gte: DATE.THIS_WEEK}, active: true}},
        //     {
        //         $group: {
        //             _id: {status: PAYMENT_STATUS_ENUM.PAID},
        //             totalAmount: {$sum: '$amountToPay'},
        //             count: {$sum: 1}
        //         }
        //     }])
        const directPayments = await DirectPurchaseFromMarket.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_WEEK}}},
            {$group: {_id: '$active', totalAmount: {$sum: '$amountToPay'}, count: {$sum: 1}}}])
        const supplyPrices = await ProductSupply.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_WEEK}, active: true}},
            {$group: {_id: '$active', totalAmount: {$sum: '$supply_price'}, count: {$sum: 1}}}])


        let total = 0;
        if (momoPayments[0]) {

            total += momoPayments[0].totalAmount;
        }
        if (cardPayments[0]) {
            total += cardPayments[0].totalAmount;
        }
        if (directPayments[0]) {
            total += directPayments[0].totalAmount;
        }
        if (supplyPrices[0]) {
            total -= supplyPrices[0].totalAmount;
        }
        return total;
    } else if (timeframe === 'THIS_MONTH') {
        const momoPayments = await OnlinePayment.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_MONTH}, active: true}},
            {
                $group: {
                    _id: {status: PAYMENT_STATUS_ENUM.PAID},
                    totalAmount: {$sum: '$amountToPay'},
                    count: {$sum: 1}
                }
            }])
        // const cardPayments = await CardPayment.aggregate([
        //     {$match: {createdAt: {$gte: DATE.THIS_MONTH}, active: true}},
        //     {
        //         $group: {
        //             _id: {status: PAYMENT_STATUS_ENUM.PAID},
        //             totalAmount: {$sum: '$amountToPay'},
        //             count: {$sum: 1}
        //         }
        //     }])
        const directPayments = await DirectPurchaseFromMarket.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_MONTH}}},
            {$group: {_id: '$active', totalAmount: {$sum: '$amountToPay'}, count: {$sum: 1}}}])
        const supplyPrices = await ProductSupply.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_MONTH}, active: true}},
            {$group: {_id: '$active', totalAmount: {$sum: '$supply_price'}, count: {$sum: 1}}}])

        let total = 0;
        if (momoPayments[0]) {
            total += momoPayments[0].totalAmount;
        }
        if (cardPayments[0]) {
            total += cardPayments[0].totalAmount;
        }
        if (directPayments[0]) {
            total += directPayments[0].totalAmount;
        }
        if (supplyPrices[0]) {
            total -= supplyPrices[0].totalAmount;
        }
        return total;
    } else if (timeframe === 'THIS_YEAR') {
        const momoPayments = await OnlinePayment.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_YEAR}, active: true}},
            {
                $group: {
                    _id: {status: PAYMENT_STATUS_ENUM.PAID},
                    totalAmount: {$sum: '$amountToPay'},
                    count: {$sum: 1}
                }
            }])
        // const cardPayments = await CardPayment.aggregate([
        //     {$match: {createdAt: {$gte: DATE.THIS_YEAR}, active: true}},
        //     {
        //         $group: {
        //             _id: {status: PAYMENT_STATUS_ENUM.PAID},
        //             totalAmount: {$sum: '$amountToPay'},
        //             count: {$sum: 1}
        //         }
        //     }])
        const directPayments = await DirectPurchaseFromMarket.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_YEAR}}},
            {$group: {_id: '$active', totalAmount: {$sum: '$amountToPay'}, count: {$sum: 1}}}])
        const supplyPrices = await ProductSupply.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_YEAR}, active: true}},
            {$group: {_id: '$active', totalAmount: {$sum: '$supply_price'}, count: {$sum: 1}}}])

        let total = 0;
        if (momoPayments[0]) {
            total += momoPayments[0].totalAmount;
            console.log(total);
        }
        if (cardPayments[0]) {
            total += cardPayments[0].totalAmount;
            console.log(total)
        }
        if (directPayments[0]) {
            total += directPayments[0].totalAmount;
        }
        if (supplyPrices[0]) {
            total -= supplyPrices[0].totalAmount;
        }
        return total;
    }
}


exports.getDirectPurchaseStatistics = async (timeframe = 'NONE') => {
    if (timeframe === 'NONE') {
        const total = await DirectPurchaseFromMarket.find().countDocuments();
        console.log(total)
        return {total};
    } else if (timeframe === 'THIS_WEEK') {
        const mapping = {days: range(1, 7), totals: range(1, 7, true)};

        let i = 0;

        for (const day of mapping.days) {
            const total = await DirectPurchaseFromMarket.find({
                createdAt: {$gte: DATE.THIS_WEEK},
                day: day
            }).countDocuments();
            mapping.totals[i] += total;
            i++;
        }
        return mapping;
    } else if (timeframe === 'THIS_MONTH') {
        const mapping = {days: range(1, 31), totals: range(1, 31, true)};

        let i = 0;

        for (const day of mapping.days) {
            const total = await DirectPurchaseFromMarket.find({
                createdAt: {$gte: DATE.THIS_MONTH},
                day: day
            }).countDocuments();
            mapping.totals[i] += total;
            i++;
        }
        return mapping;
    } else if (timeframe === 'THIS_YEAR') {
        const mapping = {months: range(1, 12), totals: range(1, 12, true)};

        let i = 0;

        for (const month of mapping.months) {
            const total = await DirectPurchaseFromMarket.find({
                createdAt: {$gte: DATE.THIS_YEAR},
                month: month
            }).countDocuments();
            mapping.totals[i] += total;
            i++;
        }
        return mapping;
    }
}


exports.getDirectPurchaseStatisticsTotals = async (timeframe = 'NONE') => {
    if (timeframe === 'NONE') {

        const directPayments = await DirectPurchaseFromMarket.aggregate([
            {
                $group: {
                    _id: {status: PAYMENT_STATUS_ENUM.PAID},
                    totalAmount: {$sum: '$amountToPay'},
                    count: {$sum: 1}
                }
            }])


        let total = 0;

        if (directPayments[0]) {
            total += directPayments[0].totalAmount;
        }

        return total;
    } else if (timeframe === 'THIS_WEEK') {

        const directPayments = await DirectPurchaseFromMarket.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_WEEK}, active: true}},
            {$group: {_id: '$active', totalAmount: {$sum: '$amountToPay'}, count: {$sum: 1}}}])

        let total = 0;

        if (directPayments[0]) {
            total += directPayments[0].totalAmount;
        }

        return total;
    } else if (timeframe === 'THIS_MONTH') {

        const directPayments = await DirectPurchaseFromMarket.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_MONTH}}},
            {$group: {_id: '$active', totalAmount: {$sum: '$amountToPay'}, count: {$sum: 1}}}])


        let total = 0;

        if (directPayments[0]) {
            total += directPayments[0].totalAmount;
        }

        return total;
    } else if (timeframe === 'THIS_YEAR') {

        const directPayments = await DirectPurchaseFromMarket.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_YEAR}}},
            {$group: {_id: '$active', totalAmount: {$sum: '$amountToPay'}, count: {$sum: 1}}}])

        let total = 0;

        if (directPayments[0]) {
            total += directPayments[0].totalAmount;
        }

        return total;
    }
}


////////////////////////////////////////


exports.getSiteVisitorsStatistics = async (timeframe = 'NONE') => {
    const [DAY, , MONTH, YEAR] = genTimestamps();
    if (timeframe === 'NONE') {
        const total = await SiteVisitor.find({active: true}).countDocuments();
        return {total};
    } else if (timeframe === 'THIS_WEEK') {
        const mapping = {days: range(1, 7), totals: range(1, 7, true)};

        let i = 0;

        for (const day of mapping.days) {
            const total = await SiteVisitor.find({
                active: true,
                createdAt: {$gte: DATE.THIS_WEEK},
                day: day
            }).countDocuments();
            mapping.totals[i] += total;
            i++;
        }
        return mapping;
    } else if (timeframe === 'THIS_MONTH') {
        let mappings = []

        for (let i = 1; i < DAY + 1; i++) {
            const total = await SiteVisitor.find({
                active: true,
                createdAt: {$gte: DATE.THIS_MONTH},
                month: MONTH,
                year: YEAR,
                day: i
            }).countDocuments();

            mappings.push({
                day: i,
                visits: total
            })
        }
        return mappings;
    } else if (timeframe === 'THIS_YEAR') {
        let mappings = []
        for (let i = 1; i <= MONTH; i++) {
            const total = await SiteVisitor.find({
                active: true,
                createdAt: {$gte: DATE.THIS_YEAR},
                month: i,
                year: YEAR
            }).countDocuments();

            mappings.push({
                day: i,
                visits: total
            })
        }
        return mappings;
    }
}


exports.getSiteVisitorsStatisticsTotals = async (timeframe = 'NONE') => {
    const [, , MONTH, YEAR] = genTimestamps();

    if (timeframe === 'NONE') {
        const total = await SiteVisitor.find({active: true}).countDocuments();
        return {total};
    } else if (timeframe === 'THIS_WEEK') {
        const total = await SiteVisitor.find({active: true}).countDocuments();
        return {total};
    } else if (timeframe === 'THIS_MONTH') {
        const total = await SiteVisitor.find({active: true, month: MONTH, year: YEAR}).countDocuments();
        return {total};
    } else if (timeframe === 'THIS_YEAR') {
        const total = await SiteVisitor.find({active: true, year: YEAR}).countDocuments();
        return {total};
    }
}


////////////////////////////////////////////


exports.getSupplyPricesStatistics = async (timeframe = 'NONE') => {
    if (timeframe === 'NONE') {
        const total = await ProductSupply.aggregate([
            {$match: {active: true}},
            {
                $group: {
                    _id: {status: PAYMENT_STATUS_ENUM.PAID},
                    totalAmount: {$sum: '$supply_price'},
                    count: {$sum: 1}
                }
            }])
        return {total: (total[0]) ? total[0].totalAmount : 0};
    } else if (timeframe === 'THIS_WEEK') {
        const total = await ProductSupply.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_WEEK}, active: true}},
            {$group: {_id: '$active', totalAmount: {$sum: '$supply_price'}, count: {$sum: 1}}}])
        return {total: (total[0]) ? total[0].totalAmount : 0};
    } else if (timeframe === 'THIS_MONTH') {
        const total = await ProductSupply.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_MONTH}, active: true}},
            {$group: {_id: '$active', totalAmount: {$sum: '$supply_price'}, count: {$sum: 1}}}])
        return {total: (total[0]) ? total[0].totalAmount : 0};
    } else if (timeframe === 'THIS_YEAR') {
        const total = await ProductSupply.aggregate([
            {$match: {createdAt: {$gte: DATE.THIS_YEAR}, active: true}},
            {$group: {_id: '$active', totalAmount: {$sum: '$supply_price'}, count: {$sum: 1}}}])
        return {total: (total[0]) ? total[0].totalAmount : 0};
    }
}
