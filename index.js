const dotenv = require("dotenv");
const cron = require('node-cron');

if (process.env.NODE_ENV == "development")
    dotenv.config({path: `.env.development`})
else dotenv.config()

const bodyparser = require("body-parser");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const cors = require("cors");
require("./models/db");


const {app} = require('./config/express.config');

const employeeRolesController = require('./controllers/v1/Employee/roles.controller');
const employeeCategoriesController = require('./controllers/v1/Employee/categories.controller');
const employeesController = require("./controllers/v1/Employee/employees.controller");
const productCategoriesHandler = require("./routes/ProductCategory/product-category.routes");
const supplierController = require("./controllers/v1/Supply/supplier.controller");
const deliveryZoneController = require("./controllers/v1/DeliveryLocation/delivery-zone.controller");
const deliveryCountryController = require("./controllers/v1/DeliveryLocation/delivery-country.controller");
const deliveryCountryRegionController = require("./controllers/v1/DeliveryLocation/delivery-country-region.controller");
const productSupplyHandler = require("./routes/Supply/products-supply.routes");
const suppliedProductHandler = require("./routes/Supply/supplied-products.routes");
const productHandler = require("./routes/Product/product.routes");
const productOnMarketHandler = require("./routes/Market/product-on-market.routes");
const customerController = require("./controllers/v1/Customer/customer.controller");
const customerReviewsController = require("./controllers/v1/Customer/customer-review.controller");
const authController = require("./controllers/v1/Auth/auth.controller");
const appUpdateController = require("./controllers/v1/AppUpdate/app-update.controller");
const orderHandler = require("./routes/Order/order.routes");
const productOrderController = require("./routes/Order/product-order.routes");
const contactController = require("./controllers/v1/Contact/contact.controller");
const discountController = require("./controllers/v1/Discount/discount.controller");
const onlinePaymentController = require("./controllers/v1/Payment/online-payment.controller");

const userCategoryController = require("./controllers/v1/User/user-category.controller");
const userController = require("./controllers/v1/User/user.controller");
const statisticsController = require("./controllers/v1/Statistics/statistics.controller");
const siteVisitorsController = require("./controllers/v1/SiteVisitor/site-visitor.controller");
const {notificationsController} = require("./controllers/v1/User/notifications.controller");
const incomeController = require("./controllers/v1/Reporting/income.controller");
const paymentsController = require("./controllers/v1/Payment/payments.controller")
const testModelController = require("./controllers/v1/test-model.controller");
const appliedDiscountController = require("./routes/Discounts/applied-discount.routes");


const {fileFromPathUnlink, API_RESPONSE} = require("./utils/common");
const {USER_CATEGORY_ENUM, COMPLETE_INFO_ENUM} = require("./utils/enumerations/constants");
const {isUserCategory} = require("./middlewares/authorisation/isUserCategory.middleware");
const {AUTH_MIDDLEWARE} = require("./middlewares/authorisation/auth.middleware");
const {validObjectId} = require("./utils/common");
const {Product} = require("./models/Product/product.model");
const {User} = require("./models/User/user.model");
const {AppUpdate} = require("./models/AppUpdate/app-update-model");
const {backupMongoDB} = require("./models/db");



const PORT = process.env.PORT || 4007;

const HOST =
    process.env.NODE_ENV === "production"
        ? process.env.PROD_URL
        : `localhost:${PORT}`;

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "DDC-BACKEND APIs Documentation",
            version: "1.0.0",
            description: "DDC-BACKEND  APIs Documentation",
        },
        schemes: [process.env.NODE_ENV === "production" ? "https" : "http"],
        host: HOST,
        basePath: "/",
        securityDefinitions: {
            bearerAuth: {
                type: "apiKey",
                name: "Authorization",
                scheme: "bearer",
                in: "header",
            },
        },
    },
    apis: ["index.js", "./controllers/**/*.js", "./controllers/**/**/*.js", "./routes/**/*.js", "./routes/**/**/*.js",
        "./models/**/*.js", "./models/**/**/*.js"],
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.get("/documentation/docs.json", function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocs);
});


app.use("/documentation", swaggerUi.serve, swaggerUi.setup(swaggerDocs, false, {docExpansion: "none"}));


app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());
app.use(cors());

app.use("/api/v1/user-categories", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], userCategoryController);
app.use("/api/v1/employee-roles", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], employeeRolesController);
app.use("/api/v1/employee-categories", employeeCategoriesController);
app.use("/api/v1/users", userController);
app.use("/api/v1/employees", employeesController);
app.use("/api/v1/customers", customerController);
app.use("/api/v1/suppliers", supplierController);
app.use("/api/v1/applied-discounts", appliedDiscountController);
app.use("/api/v1/contacts", contactController);
app.use("/api/v1/test-models", testModelController);

app.use("/api/v1/product-categories", productCategoriesHandler);
app.use("/api/v1/products-supply", productSupplyHandler);
app.use("/api/v1/supplied-products", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], suppliedProductHandler);


app.use("/api/v1/products", productHandler);

app.use("/api/v1/products-on-market", productOnMarketHandler);

app.use("/api/v1/customer-reviews", customerReviewsController);
app.use("/api/v1/auth", authController);
app.use("/api/v1/app-updates", appUpdateController);
app.use("/api/v1/orders", orderHandler);
app.use("/api/v1/product-orders", productOrderController);
app.use("/api/v1/delivery-zones", deliveryZoneController);
app.use("/api/v1/delivery-country-regions", deliveryCountryRegionController);
app.use("/api/v1/delivery-countries", deliveryCountryController);
app.use("/api/v1/discounts", discountController);
app.use("/api/v1/payments", paymentsController);
app.use("/api/v1/payments/online", onlinePaymentController);

app.use("/api/v1/statistics", [AUTH_MIDDLEWARE], statisticsController);

app.use("/api/v1/site-visitors", siteVisitorsController);
app.use("/api/v1/notifications", notificationsController)
app.use("/api/v1/income", incomeController)


/**
 * @swagger
 * /api/v1/files/delete/{path}/from/{model}/id/{id}:
 *   delete:
 *     tags:
 *       - Files
 *     description: File path to delete
 *     parameters:
 *       - name: path
 *         description: File Path
 *         in: path
 *         required: true
 *         type: string
 *       - name: model
 *         description: Model that contains an Image
 *         in: path
 *         required: true
 *         type: string
 *         enum: [PRODUCT, PROFILE, APP_UPDATE ]
 *       - name: id
 *         description: Id of the Model
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
app.delete('/api/v1/files/delete/:path/from/:model/id/:id', [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
        try {
            if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

            if (!req.params.path || req.params.path === "" || req.params.path === " ") {
                return res.status(200).send(API_RESPONSE(false, 'Invalid path provided', null, 404));
            }

            if (req.params.model === 'PRODUCT') {
                let product = await Product.findById(req.params.id);

                if (!product)
                    return res.status(404).send(API_RESPONSE(false, 'Spare part not found', null, 404));

                let photos = product.photos;

                function findPhotoByPath(photo) {
                    return photo.path === req.params.path
                }

                const index = photos.indexOf(photos.find(findPhotoByPath));
                if (index > -1) photos.splice(index, 1);
                else
                    return res.status(400).send(API_RESPONSE(false, 'This image does not belong to this spare part', null, 400));

                product.photos = photos;

                await product.save();

            } else if (req.params.model === 'PROFILE') {
                let user = await User.findById(req.params.id);

                if (!user)
                    return res.status(404).send(API_RESPONSE(false, 'User not found', null, 404));

                if (user.profile !== req.params.path)
                    return res.status(400).send(API_RESPONSE(false, 'This profile does not belong to this user', null, 400));

                user.profile = "" // remove the profile and save
                await user.save();

            } else if (req.params.model === "APP_UPDATE") {

                let appUpdate = await AppUpdate.findById(req.params.id)

                if (!appUpdate)
                    return res.status(404).send(API_RESPONSE(false, 'App Update not found', null, 404));

                if (appUpdate.image !== req.params.path)
                    return res.status(400).send(API_RESPONSE(false, 'This Image does not belong to this app update', null, 400));

                appUpdate.image = "";

                await appUpdate.save();

            } else
                return res.status(400).send(API_RESPONSE(false, 'Invalid Model', null, 404)); // invalid model
            const deleted = await fileFromPathUnlink(req.params.path);
            if (!deleted) return res.status(200).send(API_RESPONSE(false, 'Path not found', null, 404));

            return res.status(200).send(API_RESPONSE(true, 'File Deleted successfully', null, 200));
        } catch
            (err) {
            return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
        }
    }
)
;


/**
 * @swagger
 * /api/v1/files/load/{path}:
 *   get:
 *     tags:
 *       - Files
 *     description: File path to load
 *     parameters:
 *       - name: path
 *         description: File Path
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */
app.get('/api/files/load/:path', async (req, res) => {
    try {
        const file = req.params.path;
        res.sendFile(file); // Set disposition and send it.
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/test:
 *   get:
 *     tags:
 *       - Files
 *     description: testing apis
 *     parameters:
 *       - name: path
 *         description: File Path
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

app.get('/test', async (req, res) => {
    try {

        //

        // let incomes = await Income.find();
        // let i = 0;
        // for (const income of incomes) {
        //     await Income.findByIdAndDelete(income._id)
        //     if (++i == 100)
        //         break;
        // }

        // do some thing
        // let data = await CarSupply.find()
        // for (const datum of data)
        //     await CarSupply.findByIdAndDelete(datum._id)
        //
        // data = await SuppliedCar.find()
        // for (const datum of data)
        //     await SuppliedCar.findByIdAndDelete(datum._id)
        //
        // data = await CarOnMarkert.find()
        // for (const datum of data)
        //     await CarOnMarkert.findByIdAndDelete(datum._id)
        //
        // data = await CarDirectPurchase.find()
        // for (const datum of data)
        //     await CarDirectPurchase.findByIdAndDelete(datum._id)

        // data = await CarOrder.find()
        // for (const datum of data)
        //     await CarOrder.findByIdAndDelete(datum._id)
        //
        //
        // data = await CarBooking.find()
        // for (const datum of data)
        //     await CarBooking.findByIdAndDelete(datum._id)
        //
        //
        // data = await CarOrderPayment.find()
        // for (const datum of data)
        //     await CarOrderPayment.findByIdAndDelete(datum._id)
        //
        // data = await CarDirectPurchasePayment.find()
        // for (const datum of data)
        //     await CarDirectPurchasePayment.findByIdAndDelete(datum._id)
        //
        // data = await DeliveryShippingOrigin.find()
        // for (const datum of data)
        //     await DeliveryShippingOrigin.findByIdAndDelete(datum._id)
        //
        //
        // data = await DeliveryPort.find()
        // for (const datum of data)
        //     await DeliveryPort.findByIdAndDelete(datum._id)
        //
        //
        // data = await PortPricing.find()
        // for (const datum of data)
        //     await PortPricing.findByIdAndDelete(datum._id)

        // await sendTestingEmail("andesanselme@gmail.com")
        // return res.send({savedLen: savedParts.length, existingLen: spareParts.length, parts: savedParts})
    } catch (e) {
        return res.send(e.message)
    }
})


