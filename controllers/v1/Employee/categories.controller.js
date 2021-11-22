const { USER_CATEGORY_ENUM } = require("../../../utils/enumerations/constants");
const { isUserCategory } = require("../../../middlewares/authorisation/isUserCategory.middleware");
const { AUTH_MIDDLEWARE } = require("../../../middlewares/authorisation/auth.middleware");
const { API_RESPONSE } = require("../../../utils/common");
const { Employee } = require("../../../models/Employee/employees.model");
const { dependencyChecker } = require("../../../utils/common");
const { Category, validate, validateRoles } = require('../../../models/Employee/categories.model');
const { Role } = require('../../../models/Employee/roles.model');
const { validObjectId } = require('../../../utils/common');
const router = require('express').Router()

/**
 * @swagger
 * /api/v1/employee-categories:
 *   get:
 *     tags:
 *       - EmployeeCategories
 *     description: Returns an array of EmployeeCategories
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
// router.get("/",  async (req, res) => {
router.get("/", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN ]) ], async (req, res) => {
    const { limit, page } = req.query;
    const options = { limit: limit || 30, populate: 'roles', sort: { updatedAt: -1 }, page: (page - 1) || 1 }
    
    try {
        const categories = await Category.paginate({ active: true }, options);
        return res.status(200).send(categories);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/employee-categories/{id}:
 *   get:
 *     tags:
 *       - EmployeeCategories
 *     description: Returns a single ProductCategory
 *     parameters:
 *       - name: id
 *         description: EmployeeCategories's id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */

router.get("/:id", async (req, res) => {
    
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));
        
        const category = await Category.findById(req.params.id).populate('roles');
        if (!category) return res.status(404).send(API_RESPONSE(false, 'EmployeeCategory not found', null, 500));
        return res.status(200).send(category);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
})


/**
 * @swagger
 * /api/v1/employee-categories/get/roles/{id}:
 *   get:
 *     tags:
 *       - EmployeeCategories
 *     description: Returns an array of Roles
 *     parameters:
 *       - name: id
 *         description: EmployeeCategory id
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

router.get("/get/roles/:id", async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
    
        const category = await Category.findById(req.params.id).sort({ updatedAt: -1 }).populate('roles');
        if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found', null, 404));
    
        const roles = category.roles;
        return res.status(400).send(roles);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employee-categories:
 *   post:
 *     tags:
 *       - EmployeeCategories
 *     description: Creates a new EmployeeCategory
 *     parameters:
 *       - name: body
 *         description: EmployeeCategory fields
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/EmployeeCategory'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request | Validation Error
 *       500:
 *         description: Internal Server Error
 */
// router.post("/", async (req, res) => {
router.post("/", [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN ]) ], async (req, res) => {
    try {
        
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        const duplicate = await Category.findOne({ category: req.body.category });
        if (duplicate) return res.status(400).send(API_RESPONSE(false, 'EmployeeCategory already exists', null, 500));
        
        for (const role of req.body.roles)
            if (!await Role.findById(role)) return res.status(404).send(API_RESPONSE(false, 'Role not found', null, 500));
        
        req.body.category = req.body.category.toUpperCase();
        const newCategory = new Category(req.body);
        
        const saved = await newCategory.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, 'EmployeeCategory not saved', null, 500));
        return res.status(201).send(saved);
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employee-categories/create/roles/{id}:
 *   post:
 *     tags:
 *       - EmployeeCategories
 *     description: Add a new Role to EmployeeCategory
 *     parameters:
 *       - name: id
 *         description: EmployeeCategory Id
 *         in: path
 *         required: true
 *       - name: body
 *         description: EmployeeCategory fields
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/EmployeeCategoryNewRole'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request | Validation Error
 *       500:
 *         description: Internal Server Error
 */
router.post("/create/roles/:id", async (req, res) => {
    
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const { error } = validateRoles(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        const category = await Category.findById(req.params.id)
        if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found', null, 404));
        
        for (const role of req.body.roles) {
            if (!(await Role.findById(role))) return res.status(404).send(API_RESPONSE(false, 'Role not found', null, 400));
            if (category.roles.indexOf(role) === -1)
                category.roles.push(role);
        }
        
        
        const updated = await category.save();
        if (updated) return res.status(201).send(updated);
        return res.status(500).send(API_RESPONSE(false, 'ProductCategory not updated', null, 500))
        
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employee-categories/{id}:
 *   put:
 *     tags:
 *       - EmployeeCategories
 *     description: Updates a EmployeeCategory
 *     parameters:
 *       - name: body
 *         description: EmployeeCategory fields
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/EmployeeCategory'
 *       - name: id
 *         in: path
 *         type: string
 *         description: EmployeeCategory id
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad Request | Validation Error
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id', [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));
        
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        
        const category = await Category.findById(req.params.id)
        if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found', null, 500));
        
        for (const role of req.body.roles)
            if (await Role.findById(role)) return res.status(404).send(API_RESPONSE(false, 'Role not found', null, 500))
        
        req.body.category = req.body.category.toUpperCase();
        const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(500).send(API_RESPONSE(false, 'EmployeeCategory not updated', null, 500));
        return res.status(200).send(updated);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employee-categories/{id}:
 *   delete:
 *     tags:
 *       - EmployeeCategories
 *     description: Deletes a single EmployeeCategory
 *     parameters:
 *       - name: id
 *         description: EmployeeCategory id
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
router.delete('/:id', [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 400));
        
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).send(API_RESPONSE(false, 'EmployeeCategory not found', null, 404));
        
        const employeeDependency = await dependencyChecker(Employee, 'category', req.params.id);
        if (employeeDependency) return res.status(200).send(API_RESPONSE(false, 'Record cannot be deleted\nIt has dependencies', null, 500));
        
        const deleted = await Category.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
        if (!deleted) return res.status(500).send(API_RESPONSE(false, 'EmployeeCategory not deleted', null, 500));
        return res.status(200).send(API_RESPONSE(false, 'EmployeeCategory deleted successfully', null, 500));
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
    
});


/**
 * @swagger
 * /api/v1/employee-categories/category/{id}/delete/role/{roleId}:
 *   delete:
 *     tags:
 *       - EmployeeCategories
 *     description: Deletes a single Role in a EmployeeCategory
 *     parameters:
 *       - name: id
 *         description: EmployeeCategory id
 *         in: path
 *         required: true
 *         type: string
 *       - name: roleId
 *         description: UserRole id
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
router.delete('/category/:id/delete/role/:roleId', [ AUTH_MIDDLEWARE, isUserCategory([ USER_CATEGORY_ENUM.SYSTEM_ADMIN ]) ], async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));
        if (!(validObjectId(req.params.roleId))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));
        
        const category = await Category.findById(req.params.id)
        if (!category) return res.status(404).send(API_RESPONSE(false, 'ProductCategory not found', null, 500));
        
        
        const employeeDependency = await dependencyChecker(Employee, 'category', req.params.id);
        if (employeeDependency) return res.status(200).send(API_RESPONSE(false, 'Record cannot be deleted\nIt has dependencies', null, 500));
        
        category.roles.pull(req.params.roleId);
        
        const deleted = await category.save();
        if (!deleted) return res.status(500).send(c);
        return res.status(200).send(API_RESPONSE(false, 'Role deleted successfully', null, 500));
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


module.exports = router;
