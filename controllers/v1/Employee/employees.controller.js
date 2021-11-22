const express = require("express");
const {USER_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {EMPLOYEE_STATUS_ENUM} = require("../../../utils/enumerations/constants");
const {USER_CATEGORY_ENUM} = require("../../../utils/enumerations/constants");
const {isUserCategory} = require("../../../middlewares/authorisation/isUserCategory.middleware");
const {AUTH_MIDDLEWARE} = require("../../../middlewares/authorisation/auth.middleware");
const {API_RESPONSE} = require("../../../utils/common");
const {Employee} = require("../../../models/Employee/employees.model");
const {Category} = require('../../../models/Employee/categories.model');
const {User} = require('../../../models/User/user.model');
const {validObjectId} = require('../../../utils/common');

const router = express.Router();

const POPULATOR = {
    path: 'user employeeCategory',
    populate: {
        path: 'employeeCategory part_in_stock'
    }
}

/**
 * @swagger
 * /api/v1/employees:
 *   get:
 *     tags:
 *       - Employees
 *     description: Returns an array of Employees
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

router.get("/", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    const {limit, page} = req.query;
    const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: page || 1}

    try {
        const employees = await Employee.paginate({}, options);
        return res.status(200).send(employees);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employees/search:
 *   get:
 *     tags:
 *       - Employees
 *     description: Returns Employees with a certain name
 *     parameters:
 *       - name: name
 *         description: Name
 *         in: query
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
router.get('/search', async (req, res) => {
    try {
        const name = req.query.name;
        if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
        const regex = new RegExp(name, 'gi');

        const users = await User.find({$or: [{firstName: {$regex: regex}}, {lastName: {$regex: regex}}]});
        const ids = users.map(user => user._id);

        const employees = await Employee.find({user: {$in: ids}}).sort({updatedAt: -1}).populate(POPULATOR);

        return res.status(200).send(employees);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employees/search/paginated:
 *   get:
 *     tags:
 *       - Employees
 *     description: Returns Paginated Employees with a certain name
 *     parameters:
 *       - name: name
 *         description: Name
 *         in: query
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
router.get('/search/paginated', async (req, res) => {
    try {
        const {limit, page} = req.query;
        const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: page || 1}

        const name = req.query.name;
        if (!name) return res.status(404).send(API_RESPONSE(false, 'QueryParam not found', null, 404))
        const regex = new RegExp(name, 'gi');


        const users = await User.find({$or: [{firstName: {$regex: regex}}, {lastName: {$regex: regex}}]});
        const ids = users.map(user => user._id);

        const employees = await Employee.paginate({user: {$in: ids}}, options);

        return res.status(200).send(employees);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employees/paginated:
 *   get:
 *     tags:
 *       - Employees
 *     description: Returns an array of Employees
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
    const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: page || 1}

    try {
        const employees = await Employee.paginate({}, options);
        return res.status(200).send(employees);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employees/status/{status}:
 *   get:
 *     tags:
 *       - Employees
 *     description: Returns an array of Employees with a status
 *     parameters:
 *       - name: status
 *         description: Customer Status
 *         type: string
 *         in: path
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server Error
 */

router.get("/status/:status", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN])], async (req, res) => {
    if (!(EMPLOYEE_STATUS_ENUM.hasOwnProperty(req.params.status)))
        return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, {types: EMPLOYEE_STATUS_ENUM}))
    
    try {
        const employees = await Employee.find({status: req.params.status}).sort({updatedAt: -1}).populate(POPULATOR);
        return res.status(200).send(employees);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employees/status/{status}/paginated:
 *   get:
 *     tags:
 *       - Employees
 *     description: Returns an array of Employees with a status
 *     parameters:
 *       - name: status
 *         description: Employee Status
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
    const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: (page) || 1}

    if (!(EMPLOYEE_STATUS_ENUM.hasOwnProperty(req.params.status)))
        return res.status(400).send(API_RESPONSE(false, 'Status not found', null, 500, {types: EMPLOYEE_STATUS_ENUM}))

    try {
        const employees = await Employee.paginate({status: req.params.status}, options);
        return res.status(200).send(employees);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employees/category/{category}:
 *   get:
 *     tags:
 *       - Employees
 *     description: Returns Employees of a ProductCategory
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
    const options = {limit: limit || 30, populate: POPULATOR, sort: {updatedAt: -1}, page: (page) || 1}

    const category = await Category.findById(req.params.category);
    if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found', null, 500));

    try {
        const employees = await Employee.paginate({employeeCategory: req.params.category}, options);
        return res.status(200).send(employees);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }

});


/**
 * @swagger
 * /api/v1/employees/user/{id}:
 *   get:
 *     tags:
 *       - Employees
 *     description: Returns Employees From a user Id
 *     parameters:
 *       - name: id
 *         description: User Id 's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get("/user/:id", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

    const user = await User.findOne({_id: req.params.id, status: USER_STATUS_ENUM.ACTIVE});
    if (!user) return res.status(404).send(API_RESPONSE(false, 'User not found', null, 500));

    try {
        let employee = await Employee.findOne({user: req.params.id}).populate(POPULATOR);
        return res.status(200).send(employee);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }

});

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   get:
 *     tags:
 *       - Employees
 *     description: Returns a single Employee
 *     parameters:
 *       - name: id
 *         description: Employee's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */

router.get("/:id", [AUTH_MIDDLEWARE, isUserCategory([USER_CATEGORY_ENUM.SYSTEM_ADMIN, USER_CATEGORY_ENUM.EMPLOYEE])], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));

        let employee = await Employee.findById(req.params.id).populate(POPULATOR);

        if (!employee) return res.status(404).send(API_RESPONSE(false, "Employee not found", null, 500));


        return res.status(200).send(employee);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employees/{id}/status/toggle/{status}:
 *   get:
 *     tags:
 *       - Employees
 *     description: Returns a single Employee
 *     parameters:
 *       - name: id
 *         description: Employee's id
 *         in: path
 *         required: true
 *         type: string
 *       - name: status
 *         description: The New status You want to give
 *         in: path
 *         required: true
 *         type: string
 *         enum: [ACTIVE, INACTIVE, PENDING]
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal Server error
 */

router.put("/:id/status/toggle/:status", async (req, res) => {
    try {
        if (!EMPLOYEE_STATUS_ENUM.hasOwnProperty(req.params.status))
            return res.status(404).send(API_RESPONSE(false, "Status not found", null, 404));

        let employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).send(API_RESPONSE(false, "Employee not found", null, 404));

        employee.status = req.params.status

        let newEmployee = await employee.save();
        if (!newEmployee) return res.status(500).send(API_RESPONSE(false, "Failed to update the Employee", null, 500));

        return res.send(newEmployee);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})


/**
 * @swagger
 * /api/v1/employees/{id}:
 *   delete:
 *     tags:
 *       - Employees
 *     description: Deletes a single Employee
 *     parameters:
 *       - name: id
 *         description: Employee's id
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

        const employee = await Employee.findOne({_id: req.params.id, status: EMPLOYEE_STATUS_ENUM.ACTIVE});
        const user = await User.findById(employee.user);
        if (!employee) return res.status(404).send(API_RESPONSE(false, "Employee not found", null, 500));
        //
        // const partSupplyDependency = await dependencyChecker(PartSupply, 'reciever', req.params.id);
        // const directPurchaseFromMarketDependency = await dependencyChecker(DirectPurchaseFromMarket, 'created_by', req.params.id);
        //
        //  if (directPurchaseFromMarketDependency || partSupplyDependency)
        //      return res.status(200).send(API_RESPONSE(false, 'Document cannot be deleted\nIt Has dependencies', null, 500));

        const updatedEmployee = await Employee.findByIdAndUpdate(employee.id, {status: EMPLOYEE_STATUS_ENUM.INACTIVE}, {new: true});
        const updatedUser = await User.findByIdAndUpdate(user._id, {status: USER_STATUS_ENUM.INACTIVE}, {new: true});

        if (!updatedUser && !updatedEmployee) return res.status(500).send(API_RESPONSE(false, "Employee not updated", null, 500));
        return res.status(200).send(API_RESPONSE(false, "Employee deleted successfully", null, 500));
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

module.exports = router;
