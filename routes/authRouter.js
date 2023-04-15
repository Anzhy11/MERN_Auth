const express = require("express");
const router = express.Router();

// Controllers
const { register, verifyEmail, login, getUser, generateOTP, verifyOTP, createResetSession, resetPassword } = require('../controllers/authController');

// Email
const registerMail = require('../controllers/mailer')

// Middleware
const { localVariables } = require('../middleware/auth');
const VerifyUser = require('../middleware/verify-user');



// POST Methods
router.route('/register').post(register); // register user
router.route('/registerMail').post(registerMail); // send the email
router.route('/authenticate').post(VerifyUser, (req, res) => res.send('User exixts')); // authenticate user
router.route('/login').post(VerifyUser, login); // login in app

// GET Methods 
router.route('/user/:registerToken').put(verifyEmail) // verify user register token
router.route('/user/:identifier').get(getUser) // user with username
router.route('/generateOTP').get(VerifyUser, localVariables, generateOTP) // generate random OTP
router.route('/verifyOTP').get(VerifyUser, verifyOTP) // verify generated OTP
router.route('/createResetSession').get(createResetSession) // reset all the variables


// PUT Methods
router.route('/resetPassword').put(VerifyUser, resetPassword); // use to reset password



module.exports = router;