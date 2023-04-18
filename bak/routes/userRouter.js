const express = require("express");
const router = express.Router();

// Controllers
const { updateUser, updatePassword } = require('../controllers/userController');

// PUT Methods
router.route('/updateUser').put(updateUser); // is use to update the user profile
router.route('/updatePassword').put(updatePassword); // is use to update the user profile

module.exports = router;
