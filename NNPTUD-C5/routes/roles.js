var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');

// GET all roles
router.get('/', async function (req, res) {
    try {
        let roles = await roleModel.find({ isDeleted: false });
        res.send(roles);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET role by ID
router.get('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let role = await roleModel.findOne({ _id: id, isDeleted: false });
        if (!role) {
            return res.status(404).send({ message: "Role not found" });
        }
        res.send(role);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// GET all users belonging to a role
router.get('/:id/users', async function (req, res) {
    try {
        let id = req.params.id;
        let role = await roleModel.findOne({ _id: id, isDeleted: false });
        if (!role) {
            return res.status(404).send({ message: "Role not found" });
        }
        let users = await userModel.find({ role: id, isDeleted: false }).populate({
            path: 'role',
            select: 'name description'
        });
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// CREATE role
router.post('/', async function (req, res) {
    try {
        let newRole = new roleModel({
            name: req.body.name,
            description: req.body.description
        });
        await newRole.save();
        res.status(201).send(newRole);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// UPDATE role
router.put('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let updated = await roleModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: req.body },
            { new: true }
        );
        if (!updated) {
            return res.status(404).send({ message: "Role not found" });
        }
        res.send(updated);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// SOFT DELETE role
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let deleted = await roleModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );
        if (!deleted) {
            return res.status(404).send({ message: "Role not found" });
        }
        res.send({ message: "Role deleted successfully", role: deleted });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
