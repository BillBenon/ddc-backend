const express = require("express");
const { Category } = require("../../../models/Employee/categories.model");
const { dependencyChecker } = require("../../../utils/common");
const { API_RESPONSE } = require("../../../utils/common");
const { Role, validate } = require("../../../models/Employee/roles.model");
const router = express.Router();
const { validObjectId } = require('../../../utils/common');

/**
 * @swagger
 * /api/v1/employee-roles:
 *   get:
 *     tags:
 *       - EmployeeRoles
 *     description: Returns an array of Roles
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

router.get("/", async (req, res) => {
    const { limit, page } = req.query;
    const options = { limit: limit || 30, sort: { updatedAt: -1 }, page: (page - 1) || 1 }
    
    try {
        const roles = await Role.paginate({ active: true }, options);
        return res.status(200).send(roles);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/employee-roles/{id}:
 *   get:
 *     tags:
 *       - EmployeeRoles
 *     description: Returns a single Role
 *     parameters:
 *       - name: id
 *         description: EmployeeRole's id
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
    
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).send(API_RESPONSE(false, "Role not found", null, 500));
        return res.status(200).send(role);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});


/**
 * @swagger
 * /api/v1/employee-roles:
 *   post:
 *     tags:
 *       - EmployeeRoles
 *     description: Creates a new Role
 *     parameters:
 *       - name: body
 *         description: Fields for a role
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/EmployeeRole'
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
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
    
    
        const existing = await Role.findOne({ role: req.body.role });
        if (existing) return res.status(400).send(API_RESPONSE(false, "Role exists", null, 500));
    
        req.body.role = req.body.role.toUpperCase();
        const role = new Role(req.body);
    
        const saved = await role.save();
        if (!saved) return res.status(500).send(API_RESPONSE(false, "Role not saved", null, 500));
        return res.status(201).send(saved);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/employee-roles/{id}:
 *   put:
 *     tags:
 *       - EmployeeRoles
 *     description: Updates a Role
 *     parameters:
 *       - name: body
 *         description: Fields for a Role
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/EmployeeRole'
 *       - name: id
 *         in: path
 *         type: string
 *         description: Role's Id
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

router.put("/:id", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
    
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));
    
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).send(API_RESPONSE(false, "Role not found", null, 500));
    
        const updated = await Role.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!updated) return res.status(500).send(API_RESPONSE(false, "Role not updated", null, 500));
        return res.status(200).send(updated);
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

/**
 * @swagger
 * /api/v1/employee-roles/{id}:
 *   delete:
 *     tags:
 *       - EmployeeRoles
 *     description: Deletes a single Role
 *     parameters:
 *       - name: id
 *         description: Role's id
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

router.delete("/:id", async (req, res) => {
    try {
        if (!(validObjectId(req.params.id))) return res.status(400).send(API_RESPONSE(false, 'Invalid ObjectId', null, 500));
    
        const role = await Role.findById(req.params.id);
        if (!role) return res.status(404).send(API_RESPONSE(false, "Role not found", null, 500));
    
        const categoryDependency = await dependencyChecker(Category, 'roles', req.params.id);
        if (categoryDependency) return res.status(400).send(API_RESPONSE(false, 'Record cannot be deleted\nIt has dependencies', null, 400));
    
        const deleted = await Role.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
        if (!deleted) return res.status(500).send(API_RESPONSE(false, "Role not updated", null, 500));
        return res.status(200).send(API_RESPONSE(true, "Role deleted successfully", null, 200));
    } catch (err) {
        return res.status(500).send(API_RESPONSE(false, 'Internal Server Error', err.toString(), 500));
    }
});

module.exports = router;
