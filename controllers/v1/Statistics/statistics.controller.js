const express = require('express');
const {getDirectPurchaseStatisticsTotals} = require("../../../utils/statistics/admin-statistics.util");
const {getDirectPurchaseStatistics} = require("../../../utils/statistics/admin-statistics.util");
const {getSiteVisitorsStatisticsTotals} = require("../../../utils/statistics/admin-statistics.util");
const {getSiteVisitorsStatistics} = require("../../../utils/statistics/admin-statistics.util");
const {getIncomeStatisticsTotals} = require("../../../utils/statistics/admin-statistics.util");
const {DirectPurchaseFromMarket} = require("../../../models/DirectPurchaseFromMarket/direct-purchase-from-market.model");
const {getSupplyPricesStatistics} = require("../../../utils/statistics/admin-statistics.util");
const {getIncomeStatistics} = require("../../../utils/statistics/admin-statistics.util");
const {getAllCustomerStatistics} = require("../../../utils/statistics/admin-statistics.util");
const {getAllUsersStatistics} = require("../../../utils/statistics/admin-statistics.util");
const {getAllPaymentAmounts} = require("../../../utils/statistics/sales-manager-statistics.util");
const {getAllPaymentStatistics} = require("../../../utils/statistics/sales-manager-statistics.util");
const {getAllOrderStatistics} = require("../../../utils/statistics/sales-manager-statistics.util");
const {getWeekOrdersStatisticsPerDay} = require("../../../utils/statistics/sales-manager-statistics.util");
const {getWeekSuppliesStatisticsPerDay} = require("../../../utils/statistics/sales-manager-statistics.util");
const {getAllSuppliesStatistics} = require("../../../utils/statistics/sales-manager-statistics.util");
const {getCustomerPaymentAmounts} = require("../../../utils/statistics/customer-statistics.util");
const {getCustomerPaymentStatistics} = require("../../../utils/statistics/customer-statistics.util");
const {getCustomerOrderStatistics} = require("../../../utils/statistics/customer-statistics.util");
const {
    getWeekShipperStatisticsPerDay,
    getShipperShipmentsStatistics
} = require("../../../utils/statistics/shipper-statistics.util");
const {DeliveryZone} = require("../../../models/DeliveryLocation/delivery-zones.model");
const {DeliveryCountryRegion} = require("../../../models/DeliveryLocation/delivery-regions.model");
const {DeliveryCountry} = require("../../../models/DeliveryLocation/delivery-countries.model");

const {ProductCategory} = require("../../../models/ProductCategory/category.model");
const {Product} = require("../../../models/Product/product.model");
const {SHIPMENT_STATUS_ENUM, USER_CATEGORY_ENUM} = require("../../../utils/enumerations/constants");
const {SHIPPER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {ProductSupply} = require("../../../models/Supply/product-supply.model");
const {EMPLOYEE_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {Employee} = require("../../../models/Employee/employees.model");
const {OnlinePayment} = require("../../../models/Payment/online-payment.model");
const {Order} = require("../../../models/Order/order.model");
const {ORDER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {Customer} = require("../../../models/Customer/customer.model");
const {CUSTOMER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {User} = require("../../../models/User/user.model");
const {USER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {AppUpdate} = require("../../../models/AppUpdate/app-update-model");
const {
    getOverallAdminIncomeStatistics
} = require("../../../utils/statistics/income-statistics.util");
const {ProductOnMarket} = require("../../../models/Market/product-on-market.model");
const {API_RESPONSE} = require('../../../utils/common');
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const router = express.Router();


/**
 * @swagger
 * /api/v1/statistics/customer:
 *   get:
 *     tags:
 *       - Statistics
 *     description: Customer Statistics
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/customer', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.CUSTOMER])], async (req, res) => {
    try {
        if (!req.AUTH_DATA)
            return res.status(400).send(API_RESPONSE(false, 'AUTH DATA not found', null, 400));

        const user = await User.findOne({_id: req.AUTH_DATA.USER_ID, status: USER_STATUS_ENUM.ACTIVE});
        if (!user)
            return res.status(400).send(API_RESPONSE(false, 'Invalid User Status', null, 400));

        const customer = await Customer.findOne({user: req.AUTH_DATA.USER_ID, status: CUSTOMER_STATUS_ENUM.ACTIVE});

        if (!customer)
            return res.status(400).send(API_RESPONSE(false, 'USERCATEGORY NOT ALLOWED FOR THIS ENDPOINT', null, 400));


        const statistics = {
            orders: await getCustomerOrderStatistics(customer._id),
            payments: {
                statistics: await getCustomerPaymentStatistics(customer._id),
                amounts: await getCustomerPaymentAmounts(customer._id),
            },
        };
        return res.status(200).send(statistics);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/statistics/sales-manager:
 *   get:
 *     tags:
 *       - Statistics
 *     description: Sales Manager Statistics
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/sales-manager', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        if (!req.AUTH_DATA)
            return res.status(400).send(API_RESPONSE(false, 'AUTH DATA not found', null, 400));

        const user = await User.findOne({_id: req.AUTH_DATA.USER_ID, status: USER_STATUS_ENUM.ACTIVE});
        if (!user)
            return res.status(400).send(API_RESPONSE(false, 'Invalid User Status', null, 400));

        const employee = await Employee.findOne({user: req.AUTH_DATA.USER_ID, status: EMPLOYEE_STATUS_ENUM.ACTIVE});
        if (!employee || req.AUTH_DATA.EMPLOYEE_TYPE !== 'SALES_MANAGER')
            return res.status(400).send(API_RESPONSE(false, 'USERCATEGORY NOT ALLOWED FOR THIS ENDPOINT', null, 400));


        const statistics = {
            orders: {
                general: await getAllOrderStatistics(),
                currentWeek: await getWeekOrdersStatisticsPerDay(),
                lastWeek: await getWeekOrdersStatisticsPerDay(false)
            },
            payments: {
                statistics: await getAllPaymentStatistics(),
                amounts: await getAllPaymentAmounts(),
            },
            supplies: {
                general: await getAllSuppliesStatistics(),
                currentWeek: await getWeekSuppliesStatisticsPerDay(),
                lastWeek: await getWeekSuppliesStatisticsPerDay(false)
            },
            // shipments: await getAllShipmentsStatistics()
        };
        return res.status(200).send(statistics);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/statistics/shipper:
 *   get:
 *     tags:
 *       - Statistics
 *     description: Shipper Statistics
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/shipper', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SHIPPER])], async (req, res) => {
    try {
        if (!req.AUTH_DATA)
            return res.status(400).send(API_RESPONSE(false, 'AUTH DATA not found', null, 400));

        const user = await User.findOne({_id: req.AUTH_DATA.USER_ID, status: USER_STATUS_ENUM.ACTIVE});
        if (!user)
            return res.status(400).send(API_RESPONSE(false, 'Invalid User Status', null, 400));

        // const shipper = await Shipper.findOne({user: req.AUTH_DATA.USER_ID, status: SHIPPER_STATUS_ENUM.ACTIVE});
        // if (!shipper)
        //     return res.status(400).send(API_RESPONSE(false, 'USERCATEGORY NOT ALLOWED FOR THIS ENDPOINT', null, 400));


        const statistics = {
            general: await getShipperShipmentsStatistics(shipper._id),
            currentWeek: await getWeekShipperStatisticsPerDay(shipper._id),
        };

        return res.status(200).send(statistics);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/statistics/admin:
 *   get:
 *     tags:
 *       - Statistics
 *     description: Shipper Statistics
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/admin', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {
        if (!req.AUTH_DATA)
            return res.status(400).send(API_RESPONSE(false, 'AUTH DATA not found', null, 400));

        const user = await User.findOne({_id: req.AUTH_DATA.USER_ID, status: USER_STATUS_ENUM.ACTIVE});
        if (!user)
            return res.status(400).send(API_RESPONSE(false, 'Invalid User Status', null, 400));

        if (req.AUTH_DATA.USER_TYPE !== 'SYSTEM_ADMIN')
            return res.status(400).send(API_RESPONSE(false, 'USERCATEGORY NOT ALLOWED FOR THIS ENDPOINT', null, 400));


        const statistics = {
            appUpdates: await getAllAppUpdatesStatistics(),
            productCategories: await getAllCategoriesStatistics(),
            productCompanies: await getAllCompaniesStatistics(),
            deliveryAreas: await getAllDeliveryAreasStatistics(),
            employees: await getAllEmployeesStatistics(),
            productModels: await getAllModelsStatistics(),
            shippers: await getAllModelsStatistics(),
            siteVisitors: {
                currentWeek: {
                    perWeekDay: await getSiteVisitorsStatistics('THIS_WEEK'),
                    total: await getSiteVisitorsStatisticsTotals('THIS_WEEK'),
                },
                currentMonth: {
                    perMonthDay: await getSiteVisitorsStatistics('THIS_MONTH'),
                    total: await getSiteVisitorsStatisticsTotals('THIS_MONTH'),
                },
                currentYear: {
                    perMonth: await getSiteVisitorsStatistics('THIS_YEAR'),
                    total: await getSiteVisitorsStatisticsTotals('THIS_YEAR'),
                },
                general: await getSiteVisitorsStatisticsTotals
            },
            suppliers: await getAllModelsStatistics(),
            users: await getAllUsersStatistics(),
            orders: {
                today: await getAllOrderStatistics('TODAY'),
                currentWeek: await getAllOrderStatistics('THIS_WEEK'),
                currentMonth: await getAllOrderStatistics('THIS_MONTH'),
                currentYear: await getAllOrderStatistics('THIS_YEAR'),
                general: await getAllOrderStatistics()
            },
            payments: {
                statistics: await getAllPaymentStatistics(),
                amounts: await getAllPaymentAmounts(),
            },
            paymentPerChannel: await getPaymentPerChannel(),
            supplies: {
                amounts: {
                    general: await getSupplyPricesStatistics(),
                    currentWeek: await getSupplyPricesStatistics('THIS_WEEK'),
                    currentMonth: await getSupplyPricesStatistics('THIS_MONTH'),
                    currentYear: await getSupplyPricesStatistics('THIS_YEAR')
                },
                stats: await getAllSuppliesStatistics()
            },
            shipments: await getAllShipmentsStatistics(),
            customers: {
                general: await getAllCustomerStatistics(),
                currentWeek: await getAllCustomerStatistics('THIS_WEEK'),
                currentMonth: await getAllCustomerStatistics('THIS_MONTH'),
                currentYear: await getAllCustomerStatistics('THIS_YEAR')
            },
            income: {
                currentDay: 0,
                currentWeek: {
                    perWeekDay: await getIncomeStatistics('THIS_WEEK'),
                    total: await getIncomeStatisticsTotals('THIS_WEEK'),
                },
                currentMonth: {
                    perMonthDay: await getIncomeStatistics('THIS_MONTH'),
                    total: await getIncomeStatisticsTotals('THIS_MONTH'),
                },
                currentYear: {
                    perMonth: await getIncomeStatistics('THIS_YEAR'),
                    total: await getIncomeStatisticsTotals('THIS_YEAR'),
                },
                general: await getIncomeStatistics()
            },
            directPurchases: {
                currentWeek: {
                    perWeekDay: await getDirectPurchaseStatistics('THIS_WEEK'),
                    total: await getDirectPurchaseStatisticsTotals('THIS_WEEK'),
                },
                currentMonth: {
                    perMonthDay: await getDirectPurchaseStatistics('THIS_MONTH'),
                    total: await getDirectPurchaseStatisticsTotals('THIS_MONTH'),
                },
                currentYear: {
                    perMonth: await getDirectPurchaseStatistics('THIS_YEAR'),
                    total: await getDirectPurchaseStatisticsTotals('THIS_YEAR'),
                },
                general: await getDirectPurchaseStatistics()
            },
            spareParts: await getAllSparePartsStatistics(),
        };
        return res.status(200).send(statistics);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

router.get("/admin/income.service.js", async (req, res) => {
    try {
        let income = await getOverallAdminIncomeStatistics();
        return res.send({income})
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})


router.get('/customer-stats/year/:year', async (req, res) => {
    const total = await Customer.find({year: req.params.year}).countDocuments()
    return res.send({total: total});
});

router.get('/income.service.js-stats/year/:year', async (req, res) => {
    const momoPayments = await OnlinePayment.aggregate([{
        $group: {
            _id: {year: req.params.year},
            totalAmount: {$sum: '$amountToPay'},
            count: {$sum: 1}
        }
    }])
    // const cardPayments = await CardPayment.aggregate([{
    //     $group: {
    //         _id: {year: req.params.year},
    //         totalAmount: {$sum: '$amountToPay'},
    //         count: {$sum: 1}
    //     }
    // }])
    const directPayments = await DirectPurchaseFromMarket.aggregate([{
        $group: {
            _id: {year: req.params.year},
            totalAmount: {$sum: '$amountToPay'},
            count: {$sum: 1}
        }
    }])
    const supplyPrices = await ProductSupply.aggregate([{
        $group: {
            _id: {year: req.params.year},
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

    return res.status(200).send({total: total});
});


router.get('/order-stats/year/:year', async (req, res) => {
    const initiated = await Order.find({status: ORDER_STATUS_ENUM.INITIATED, year: req.params.year}).countDocuments();
    const paid = await Order.find({status: ORDER_STATUS_ENUM.PAID, year: req.params.year}).countDocuments();
    const delivered = await Order.find({status: ORDER_STATUS_ENUM.DELIVERED, year: req.params.year}).countDocuments();
    const failed = await Order.find({status: ORDER_STATUS_ENUM.FAILED, year: req.params.year}).countDocuments();

    const total = await Order.find({year: req.params.year}).countDocuments();
    const undelivered = total - delivered;
    const unpaid = total - paid;
    const successfull = total - failed;

    return res.send({
        initiated,
        paid,
        unpaid,
        delivered,
        undelivered,
        failed,
        successfull,
        total
    }).status(200);
});


router.get('/supply-stats/year/:year', async (req, res) => {
    const total = await ProductSupply.aggregate([{
        $group: {
            _id: {year: req.params.year},
            totalAmount: {$sum: '$supply_price'},
            count: {$sum: 1}
        }
    }])
    return res.status(200).send({total: (total[0]) ? total[0].totalAmount : 0});
});

const getAllShipmentsStatistics = async () => {
    // const pendingShipments = await Shipment.find({
    //     status: SHIPMENT_STATUS_ENUM.PENDING,
    //     active: true
    // }).countDocuments();
    // const cancelledShipments = await Shipment.find({
    //     status: SHIPMENT_STATUS_ENUM.CANCELLED,
    //     active: true
    // }).countDocuments();
    // const failedShipments = await Shipment.find({status: SHIPMENT_STATUS_ENUM.FAILED, active: true}).countDocuments();
    // const deliveredShipments = await Shipment.find({
    //     status: SHIPMENT_STATUS_ENUM.DELIVERED,
    //     active: true
    // }).countDocuments();

    // const totalShipments = await Shipment.find({active: true}).countDocuments();
    return {};
}

const getPaymentPerChannel = async () => {
    let webOrders = await Order.find({active: true}).countDocuments();
    let directPurchaseOrders = await DirectPurchaseFromMarket.find({active: true}).countDocuments();

    return {
        webOrders,
        directPurchaseOrders
    }
}

const getAllSparePartsStatistics = async () => {
    const totalSpareParts = await Product.find({active: true}).countDocuments();
    const quantitiesOnMarkert = await ProductOnMarket.aggregate([
        {
            $group: {
                _id: "$active",
                totalQuantity: {$sum: '$quantity'},
                count: {$sum: 1}
            }
        }
    ])
    let partsInStock = quantitiesOnMarkert.length > 0 ? quantitiesOnMarkert[0].totalQuantity : 0;
    return {totalSpareParts, partsInStock};
}


const getAllAppUpdatesStatistics = async () => {
    const total = await AppUpdate.find().countDocuments();
    return {total};
}


const getAllCategoriesStatistics = async () => {
    const totalCategories = await ProductCategory.find().countDocuments();
    const totalSubCategories =0;
    return {totalCategories, totalSubCategories};
}


const getAllCompaniesStatistics = async () => {
    const totalCompanies = await Company.find().countDocuments();
    const totalCompanyBranches = await CompanyBranch.find().countDocuments();
    return {totalCompanies, totalCompanyBranches};
}


const getAllDeliveryAreasStatistics = async () => {
    const totalDeliveryCountries = await DeliveryCountry.find({active: true}).countDocuments();
    const totalDeliveryRegions = await DeliveryCountryRegion.find({active: true}).countDocuments();
    const totalDeliveryZones = await DeliveryZone.find({active: true}).countDocuments();

    return {totalDeliveryCountries, totalDeliveryRegions, totalDeliveryZones};
}


const getAllEmployeesStatistics = async () => {
    const totalEmployees = await Employee.find({status: EMPLOYEE_STATUS_ENUM.ACTIVE}).countDocuments();

    return {totalEmployees};
}


const getAllModelsStatistics = async () => {
    const totalModels = 0;
    const totalYears = 0;
    const totalModelYears = 0;

    return {totalModels, totalYears, totalModelYears};
}


module.exports = router;
