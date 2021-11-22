const express = require('express');
const {API_RESPONSE} = require("../../../utils/common");
const {Income} = require("../../../models/Reporting/income.model");
// const { DirectPurchaseFromMarket } = require("../../../models/DirectPurchaseFromMarket/direct-purchase-from-market.model");
const {PAYMENT_STATUS_ENUM, USER_CATEGORY_ENUM} = require("../../../utils/enumerations/constants");
const {ProductOrder} = require("../../../models/Order/product-order.model");
const {ProductSupply} = require("../../../models/Supply/product-supply.model");
const {ProductOnMarket, PRODUCT_ON_MARKET_POPULATOR} = require("../../../models/Market/product-on-market.model");
const {
    getOverallAdminIncomeStatistics
} = require("../../../utils/statistics/income-statistics.util");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const {Order} = require("../../../models/Order/order.model");
const router = express.Router();

router.all("/run", (async (req, res) => {
    try {
        let today = new Date()

        let count = 1;

        do {
            let theDay = new Date(today - (86400000 * count))

            const [day, month, year] = [theDay.getDate(), theDay.getMonth(), theDay.getFullYear()]

            let income = await generateIncome(day, month, year)

            let avIncome = await Income.findOne({day, month, year})
            if (avIncome) break;
            else await income.save();

            count++;

        } while (count <= 366)

        return res.send(API_RESPONSE(true, 'Saved the response', null, 500));

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
}))


router.get("/", async (req, res) => {
    try {
        const {limit, page} = req.query;
        const options = {limit: limit || 30, sort: {updatedAt: -1}, page: page || 1}

        let incomes = await Income.paginate({}, options)
        return res.send(incomes)
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})

router.get("/statistics", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {
        let statistcs = await getOverallAdminIncomeStatistics();

        return res.send(statistcs)
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})

router.get("/test/:day/:month/:year", async (req, res) => {
    try {
        let {day, month, year} = await req.params

        let income = await generateIncome(day, month, year)

        return res.send({data: income})
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})

router.get("/test/:day/:month/:year/save", async (req, res) => {
    try {
        let {day, month, year} = await req.params

        let income = await generateIncome(day, month, year)

        let avIncome = await Income.findOne({day, month, year})
        if (avIncome) {
            await Income.findByIdAndDelete(avIncome._id)
            await income.save()
        } else {
            await income.save();
        }

        return res.send({income})
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})

async function getTotalIncome(supplyPrice, quantity, discount, buyingPrice) {
    return ((buyingPrice - supplyPrice) * quantity) - discount;
}

async function generateIncome(day, month, year) {
    let toDayFilter = {day: parseInt(day), month: parseInt(month), year: parseInt(year)}

    console.log(toDayFilter)


    let todayStart = new Date(year, month, day)
    let todayEnd = new Date(todayStart.getTime() + 86400000)

    console.log(todayStart, todayEnd)

    let web_orders = await ProductOrder.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: todayStart,
                    $lt: todayEnd
                }
            }
        },
        {
            $group: {
                _id: "$active",
                totalAmount: {$sum: '$total_products_price'},
                totalItems: {$sum: '$total_product_quantities'},
                count: {$sum: 1}
            }
        }
    ])

    console.log(web_orders)

    let supplies = await ProductSupply.aggregate([
        {$match: toDayFilter},
        {
            $group: {
                _id: "$active",
                totalAmount: {$sum: '$supply_price'},
                totalItems: {$sum: '$supply_quantity'},
                count: {$sum: 1}
            }
        }
    ])

    let thePurchasedProducts = []
    let thePurchasedProductsIds = []


    /////////////////////////////// Get all direct purchases ....

    /////////////////////////////// Get all web orders

    let theOrders = await Order.find(toDayFilter)
    let theOrdersIds = theOrders.map(order => order._id)
    let thePartOrders = await ProductOrder.find({order: {$in: theOrdersIds}}, {_id: 0, products: 1})

    for (const {products} of thePartOrders)
        for (const product of products) {
            thePurchasedProducts.push({
                partOnMarkertId: product.product,
                quantity: product.quantity,
                discount: 0,
                buyingUnitPrice: product.price / product.quantity
            })
            thePurchasedProductsIds.push(product.product)
        }

    let totalIncome = 0;


    let suppliedPrices = {}
    let productsOnMarket = await ProductOnMarket.where("_id").in(thePurchasedProductsIds).populate(PRODUCT_ON_MARKET_POPULATOR)
    for (const partOnMarkert of productsOnMarket) {
        let {
            supply_price,
            quantity
        } = partOnMarkert.supplies[partOnMarkert.supplies.length - 1].supplied_product;
        suppliedPrices[partOnMarkert._id] = supply_price / quantity;
    }


    for (const product of thePurchasedProducts)
        totalIncome += await getTotalIncome(suppliedPrices[product.partOnMarkertId], product.quantity, product.discount, product.buyingUnitPrice)

    const getNumber = (array) => {
        if (array.length === 0) return 0;
        else return array[0]
    }

    return new Income({
        day,
        month: month + 1,
        year,
        total_supply: {
            items: getNumber(supplies).totalItems,
            payments: getNumber(supplies).totalAmount,
        },
        direct_purchase_sale: {
            items: 0,
            payments: 0,
        },
        web_order_sale: {
            items: getNumber(web_orders).totalItems,
            payments: getNumber(web_orders).totalAmount,
        },
        total_income: totalIncome
    });
}

module.exports = router;