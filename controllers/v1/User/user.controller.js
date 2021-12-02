const express = require("express");
const {USER_STATUS_ENUM, NOTIFICATION_TYPE_ENUM,} = require("../../../utils/enumerations/constants");
const {ResetPassword} = require("../../../models/Auth/reset-password.model");
const {Supplier} = require("../../../models/Supply/supplier.model");
const {Employee} = require("../../../models/Employee/employees.model");
const {Customer} = require("../../../models/Customer/customer.model");
const {uploadUserProfile} = require("../../../middlewares/multer.middleware");
const {API_RESPONSE, cloudinary_configuration} = require("../../../utils/common");
const {
    User,
    validateUser,
    validatePasswordUpdate,
    validateEmployee,
    validateSupplier, getAllAdmins
} = require("../../../models/User/user.model");
const {UserCategory} = require('../../../models/User/category.model');
const {validObjectId, dependencyChecker, hashPassword} = require('../../../utils/common');
const bcrypt = require('bcryptjs')
const {getWeekRange} = require("../../../utils/common");
const {getWeekOfMonth} = require("../../../utils/common");
const {validateUserUpdate} = require("../../../models/User/user.model");
const {Category} = require("../../../models/Employee/categories.model");
const {USER_CATEGORY_ENUM} = require("../../../utils/enumerations/constants");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const {notifyMany} = require("../User/notifications.controller");
const router = express.Router();


const POPULATOR = {
    path: 'category'
}

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns an array of Users
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).send(users);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }

});


/**
 * @swagger
 * /api/v1/users/paginated:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns an array of Users
 *     parameters:
 *       - name: page
 *         description: page
 *         in: query
 *         type: string
 *       - name: limit
 *         description: limit
 *         in: query
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/paginated", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: POPULATOR, page: (page) || 1}

    try {
        const users = await User.paginate({}, options);
        return res.status(200).send(users);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }

});


/**
 * @swagger
 * /api/v1/users/status/{status}/paginated:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns an array of Users with a status
 *     parameters:
 *       - name: status
 *         description: User Status
 *         type: string
 *         in: path
 *       - name: page
 *         description: page
 *         in: query
 *         type: string
 *       - name: limit
 *         description: limit
 *         in: query
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/status/:status/paginated", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: POPULATOR, page: (page) || 1}

    if (!(USER_STATUS_ENUM.hasOwnProperty(req.params.status)))
        return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, {types: USER_STATUS_ENUM}))

    try {
        const users = await User.paginate({status: req.params.status}, options);
        return res.status(200).send(users);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }

});


/**
 * @swagger
 * /api/v1/users/status/{status}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns an array of Users with a status
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/status/:status", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    if (!(USER_STATUS_ENUM.hasOwnProperty(req.params.status)))
        return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, {types: USER_STATUS_ENUM}))

    try {
        const users = await User.find({status: req.params.status}).populate(POPULATOR);
        return res.status(200).send(users);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }

});

/**
 * @swagger
 * /api/v1/users/category/{category}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns employees in a User
 *     parameters:
 *       - name: category
 *         description: EmployeeCategory's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/category/:category", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    if (!(validObjectId(req.params.category))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: POPULATOR, page: (page) || 1}

    const category = await UserCategory.findById(req.params.category);
    if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found', null, 500));

    try {
        const users = await User.paginate({category: req.params.category}, options);
        return res.status(200).send(users);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }

});


/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns a single User
 *     parameters:
 *       - name: id
 *         description: Users's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */

router.get("/:id", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.CUSTOMER, USER_CATEGORY_ENUM.SHIPPER, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

        const user = await User.findById(req.params.id).populate(POPULATOR);
        if (!user) return res.status(404).send(API_RESPONSE(false, "Employee not found", null, 500));

        return res.status(200).send(user);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/users/username/exists/{username}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns if a User username exists
 *     parameters:
 *       - name: username
 *         description: Username
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/username/exists/:username", async (req, res) => {
    try {
        const user = await User.findOne({username: req.params.username});
        if (!user) return res.status(200).send({
            exists: false,
            message: "Username Available"
        });
        return res.status(200).send({
            exists: true,
            message: "Username Already taken"
        });
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/users/email/exists/{email}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns if a User email exists
 *     parameters:
 *       - name: email
 *         description: Email Address
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/email/exists/:email", async (req, res) => {
    try {
        const user = await User.findOne({email: req.params.email});
        if (!user) return res.status(200).send({
            exists: false,
            message: "Email Available"
        });
        return res.status(200).send({
            exists: true,
            message: "Email Already taken"
        });
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/users/phone-number/exists/{phone}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns if a User phone exists
 *     parameters:
 *       - name: phone
 *         description: Phone Number
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/phone-number/exists/:phone", async (req, res) => {
    try {
        const user = await User.findOne({phone: req.params.phone, status: USER_STATUS_ENUM.ACTIVE});
        if (!user) return res.status(200).send({
            exists: false,
            message: "PhoneNumber Available"
        });
        return res.status(200).send({
            exists: true,
            message: "PhoneNumber Already taken"
        });
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags:
 *       - Users
 *     description: Creates a new User
 *     parameters:
 *       - name: body
 *         description: Fields for an User
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid Data
 *       500:
 *         description: Internal Server Error
 */

router.post("/", async (req, res) => {
    try {
        const {error} = validateUser(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const existingUsername = await User.findOne({username: req.body.username});
        if (existingUsername) return res.status(400).send(API_RESPONSE(false, 'User username exists', null, 400));

        const existingEmail = await User.findOne({email: req.body.email});
        if (existingEmail) return res.status(400).send(API_RESPONSE(false, 'User email exists', null, 404));

        const existingPhone = await User.findOne({phone: req.body.phone});
        if (existingPhone) return res.status(400).send(API_RESPONSE(false, 'User phone-number exists', null, 400));

        const category = await UserCategory.findById(req.body.category);
        if (!category) return res.send(API_RESPONSE(false, "ProductCategory Not Found", null, 500)).status(404);

        req.body.password = await hashPassword(req.body.password);
        req.body.profile = '/opt/KOREA-AUTO-RWANDA/images/user-profiles';

        const TODAY = new Date();

        req.body.year = TODAY.getUTCFullYear();
        req.body.month = TODAY.getUTCMonth();
        req.body.day = TODAY.getUTCDate();
        const weekMappings = getWeekOfMonth(req.body.year, req.body.month);
        req.body.week = getWeekRange(weekMappings, req.body.day);

        const newUser = new User(req.body);


        const saved = await newUser.save();

        if (!saved) return res.status(500).send(API_RESPONSE(false, "User not saved", null, 500));

        // let loggedInUser = await User.findById(req.AUTH_DATA.USER_ID)

        if (req.body.extra)
            return res.status(200).send(await saveToChildCollection(null, saved, req.body.extra));
        else
            return res.status(201).send(saved);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'An error occurred', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     description: Updates a User
 *     parameters:
 *       - name: body
 *         description: Fields for a User
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *       - name: id
 *         in: path
 *         type: string
 *         description: Employee's Id
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Already Exists
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */

router.put("/:id", [AUTH_MIDDLEWARE], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

        const {error} = validateUserUpdate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const existingUsername = await User.findOne({username: req.body.username});
        if (existingUsername && (existingUsername._id != req.params.id)) return res.status(400).send(API_RESPONSE(false, 'User username exists', 400));

        const existingEmail = await User.findOne({email: req.body.email});
        if (existingEmail && (existingEmail._id != req.params.id)) return res.status(400).send(API_RESPONSE(false, 'User email exists', null, 404));

        const existingPhone = await User.findOne({phone: req.body.phone});
        if (existingPhone && (existingPhone._id != req.params.id)) return res.status(400).send(API_RESPONSE(false, 'User phone-number exists', null, 400));

        const category = await UserCategory.findById(req.body.category);
        if (!category) return res.send(API_RESPONSE(false, "ProductCategory Not Found", null, 500)).status(404);

        const updated = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if (!updated) return res.status(500).send(API_RESPONSE(false, "User not updated", null, 500));

        if (req.body.extra)
            return res.status(200).send(await updateToChildCollection(updated, req.body.extra));
        else
            return res.status(201).send(updated);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/users/upload-profile/{id}:
 *   put:
 *     tags:
 *       - Users
 *     description: Create a profile for a User
 *     consumes:
 *        - multipart/form-data
 *     parameters:
 *        - in: formData
 *          name: profile
 *          type: file
 *          description: User Profile to upload.
 *        - in: path
 *          name: id
 *          type: string
 *          required: true
 *          description: User id
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request | Validation Error
 *       500:
 *         description: Internal Server Error
 */
router.put("/upload-profile/:id", [AUTH_MIDDLEWARE, uploadUserProfile.single('profile')], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        if (!req.file) return res.status(400).send(API_RESPONSE(false, 'File not found', null, 404));

        const existingEmail = await User.findOne({email: req.body.email, active: true});
        if (existingEmail) return res.status(400).send(API_RESPONSE(false, 'User email exists', null, 400));

        const existingPhone = await User.findOne({phone: req.body.phone, active: true});
        if (existingPhone) return res.status(400).send(API_RESPONSE(false, 'User phone-number exists', null, 400));


        const exists = await User.findById(req.params.id);
        if (!exists) return res.status(400).send(API_RESPONSE(false, 'Customer not found', null, 400));


        let path = req.file.path;
        await cloudinary_configuration.uploader.upload(req.file.profile, function (err, result) {
            path = result.url
        })

        const updated = await User.findByIdAndUpdate(req.params.id, {profile: path}, {new: true});
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'User profile not updated', null, 500));
        return res.status(201).send(updated);

    } catch (err) {
        return res.status(500).send(err);
    }
});


/**
 * @swagger
 * /api/v1/users/update-password/{id}:
 *   put:
 *     tags:
 *       - Users
 *     description: Updates a User Password
 *     parameters:
 *       - name: body
 *         description: Fields for a UserPasswordUpdate
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/UserPasswordUpdate'
 *       - name: id
 *         in: path
 *         type: string
 *         description: User's Id
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Already Exists
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.put("/update-password/:id", [AUTH_MIDDLEWARE], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        const {error} = validatePasswordUpdate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({_id: req.params.id});
        if (!user) return res.status(400).send(API_RESPONSE(false, 'User not found', null, 400));


        const validPassword = await bcrypt.compare(req.body.current_password, user.password);
        if (!validPassword) return res.status(404).send(API_RESPONSE(false, 'Invalid email or password', null, 404));

        const hashedPassword = await hashPassword(req.body.new_password);

        const updated = await User.findByIdAndUpdate(req.params.id, {password: hashedPassword}, {new: true});
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'User password not updated', null, 400));
        return res.status(201).send(updated);

    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/users/{id}/status/toggle/{status}:
 *   put:
 *     tags:
 *       - Users
 *     description: Toggles the Users Status
 *     parameters:
 *       - name: id
 *         description: The Id of the User
 *         in: body
 *         required: true
 *       - name: status
 *         in: path
 *         type: string
 *         enum: [PENDING, ACTIVE, INACTIVE]
 *         description: The Status you want to give to the user
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Already Exists
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.put("/:id/status/toggle/:status", [AUTH_MIDDLEWARE], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id)))
            return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));

        if (!USER_STATUS_ENUM.hasOwnProperty(req.params.status))
            return res.status(400).send(API_RESPONSE(false, 'Invalid Status', null, 400));

        let user = await User.findById(req.params.id)
        if (!user)
            return res.status(404).send(API_RESPONSE(false, "User Not found", null, 404))


        // shipper
        let shipper = await Shipper.findOne({user: user._id})
        if (shipper) {
            shipper.status = req.params.status
            await shipper.save();
        }

        // employee
        let employee = await Employee.findOne({user: user._id})
        if (employee) {
            employee.status = req.params.status
            await employee.save();
        }

        // customer
        let customer = await Customer.findOne({user: user._id})
        if (customer) {
            customer.status = req.params.status
            await customer.save();
        }

        // supplier
        let supplier = await Supplier.findOne({user: user._id})
        if (supplier) {
            supplier.status = req.params.status
            await supplier.save();
        }

        user.status = req.params.status

        let newUser = await user.save();
        if (!newUser)
            return res.status(500).send(API_RESPONSE(false, "Failed to save the User", null, 500))

        let loggedInUser = await User.findById(req.AUTH_DATA.USER_ID)
        const message = loggedInUser.firstName + " " + loggedInUser.lastName + " markerd  " + newUser.firstName + " " + newUser.lastName + "'s status to " + req.params.status;

        await notifyMany(await getAllAdmins(), newUser._id, NOTIFICATION_TYPE_ENUM.USER_STATUS_CHANGED, message)


        return res.send(newUser)
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     description: Deletes a single User
 *     parameters:
 *       - name: id
 *         description: User's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.delete("/:id", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

        const user = await User.findOne({_id: req.params.id, status: USER_STATUS_ENUM.ACTIVE});
        if (!user) return res.status(404).send(API_RESPONSE(false, "User not found", null, 500));

        // const suppliedPartDependency = await dependencyChecker(PartSupply, 'reciever', req.params.id);
        // if (suppliedPartDependency) return res.status(200).send(API_RESPONSE(false, 'Document cannot be deleted\nIt Has dependencies', null, 500));
        const resetPasswordDependency = await dependencyChecker(ResetPassword, 'user', req.params.id);
        const customerDependency = await dependencyChecker(Customer, 'user', req.params.id);
        const employeeDependency = await dependencyChecker(Employee, 'user', req.params.id);
        const supplierDependency = await dependencyChecker(Supplier, 'user', req.params.id);
        const shipperDependency = await dependencyChecker(Shipper, 'user', req.params.id);

        if (resetPasswordDependency || customerDependency || employeeDependency || supplierDependency || shipperDependency)
            return res.status(400).send(API_RESPONSE(false, 'Document cannot be deleted\nIt Has dependencies', null, 400));

        const deleted = await User.findByIdAndUpdate(req.params.id, {status: USER_STATUS_ENUM.INACTIVE}, {new: true});
        if (!deleted) return res.status(500).send(API_RESPONSE(false, "Employee not updated", null, 500));
        return res.status(200).send(API_RESPONSE(false, "Employee deleted successfully", null, 500));
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


const saveToChildCollection = async (authenticatedUser = null, user, data) => {
    try {

        let validation, saved;
        const collection = await UserCategory.findById(user.category);

        switch (collection.name) {
            case 'CUSTOMER':
                const newCustomer = new Customer({
                    user: user._id
                });
                saved = await newCustomer.save();
                return await Customer.populate(saved, {path: 'user'});
            case 'SUPPLIER':
                validation = validateSupplier(data);
                if (validation.error) {
                    await User.findByIdAndDelete(user._id);
                    return API_RESPONSE(false, validation.error.details[0].message, null, 400);
                }

                const newSupplier = new Supplier({
                    user: user._id,
                    address: data.address
                });
                saved = await newSupplier.save()
                return await Supplier.populate(saved, {path: 'user'});

            case 'EMPLOYEE':
                validation = validateEmployee(data);
                if (validation.error) {
                    await User.findByIdAndDelete(user._id);
                    return API_RESPONSE(false, validation.error.details[0].message, null, 400);
                }

                const category = await Category.findById(data.employeeCategory);
                if (!category) return API_RESPONSE(false, 'ProductCategory not found', null, 404);

                const newEmployee = new Employee({
                    user: user._id,
                    nationalId: data.nationalId,
                    employeeCategory: data.employeeCategory
                });
                saved = newEmployee.save();
                return await Employee.populate(saved, {path: 'user'});
            default:
                return API_RESPONSE(false, 'Collection not allowed', null, 500);
        }
    } catch (err) {
        await User.findByIdAndDelete(user._id);
        return API_RESPONSE(false, 'An error occurred', err.toString(), 500);
    }
}

const updateToChildCollection = async (user, data, id) => {
    try {

        let validation, updated;
        const collection = await UserCategory.findById(user.category);

        switch (collection.name) {
            case 'SUPPLIER':
                validation = validateSupplier(data);
                if (validation.error) {
                    await User.findByIdAndDelete(user._id);
                    return API_RESPONSE(false, validation.error.details[0].message, null, 400);
                }
                const supplier = await Supplier.findOne({user: id});
                if (!supplier) return API_RESPONSE(false, 'Supplier not found', null, 404);

                updated = await Supplier.findByIdAndUpdate(id, {address: data.address}, {new: true});
                if (!updated) return API_RESPONSE(false, 'Supplier not updated', null, 500);
                return await Supplier.populate(updated, {path: 'user'});
            case 'EMPLOYEE':
                validation = validateEmployee(data);
                if (validation.error) {
                    await User.findByIdAndDelete(user._id);
                    return API_RESPONSE(false, validation.error.details[0].message, null, 400);
                }

                const employee = await Employee.findOne({user: id});
                if (!employee) return API_RESPONSE(false, 'Employee not found', null, 404);

                const category = await Category.findById(data.employeeCategory);
                if (!category) return API_RESPONSE(false, 'ProductCategory not found', null, 404);

                updated = await Employee.findByIdAndUpdate(id, {
                    nationalId: data.nationalId,
                    employeeCategory: data.employeeCategory
                }, {new: true});
                if (!updated) return API_RESPONSE(false, 'Employee not updated', null, 500);
                return await Employee.populate(updated, {path: 'user'});
            default:
                return API_RESPONSE(false, 'Collection not allowed', null, 500);
        }
    } catch (err) {
        await User.findByIdAndDelete(user._id);
        return API_RESPONSE(false, 'An error occurred', err.toString(), 500);
    }
}


module.exports = router;
