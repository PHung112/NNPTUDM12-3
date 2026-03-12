var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');

// GET all users
router.get('/', async function (req, res) {
    try {
        let users = await userModel.find({ isDeleted: false }).populate({
            path: 'role',
            select: 'name description'
        });
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// CREATE user
router.post('/', async function (req, res) {
    try {
        let newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            role: req.body.role
        });
        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// GET user by ID
router.get('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let user = await userModel.findOne({ _id: id, isDeleted: false }).populate({
            path: 'role',
            select: 'name description'
        });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send(user);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// UPDATE user
router.put('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        // Prevent updating sensitive fields via this endpoint
        delete req.body.password;
        delete req.body.isDeleted;
        let updated = await userModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: req.body },
            { new: true }
        );
        if (!updated) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send(updated);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// SOFT DELETE user
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let deleted = await userModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );
        if (!deleted) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// POST /enable - set status = true if email and username match
router.post('/enable', async function (req, res) {
    try {
        let { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).send({ message: "email and username are required" });
        }
        let user = await userModel.findOneAndUpdate(
            { email: email, username: username, isDeleted: false },
            { $set: { status: true } },
            { new: true }
        );
        if (!user) {
            return res.status(404).send({ message: "User not found or credentials do not match" });
        }
        res.send({ message: "User enabled successfully", user });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST /disable - set status = false if email and username match
router.post('/disable', async function (req, res) {
    try {
        let { email, username } = req.body;
        if (!email || !username) {
            return res.status(400).send({ message: "email and username are required" });
        }
        let user = await userModel.findOneAndUpdate(
            { email: email, username: username, isDeleted: false },
            { $set: { status: false } },
            { new: true }
        );
        if (!user) {
            return res.status(404).send({ message: "User not found or credentials do not match" });
        }
        res.send({ message: "User disabled successfully", user });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
