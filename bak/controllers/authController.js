const User = require('../models/User.js');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const { registerToken } = require('../utils/gen-registerToken.js')


/** POST: http://localhost:5050/api/v1/register 
 * @param : {
  "username" : "test123",
  "password" : "admin123",
  "email": "test1@test.com",
  "firstName" : "admin",
  "lastName": "test",
  "mobile": 8009860560,
  "address" : "9, Odonguyan, Ikorodu",
  "profile": ""
}
*/
const register = async (req, res) => {
    const profile = req.body.profile || ''

    const user = await User.create({ registerToken, profile, ...req.body });
    const token = user.createJWT()
    res
        .status(StatusCodes.CREATED)
        .json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile,
                registerToken: user.registerToken
            },
            token
        })
}

// GET: http://localhost:5050/api/v1/user/registerToken
const verifyEmail = async (req, res) => {
    const { registerToken } = req.params;
    if (!registerToken) {
        throw new BadRequestError("Invalid token");
    }
    // check if user exists 
    const user = await User.findOne({ registerToken });
    if (!user) {
        throw new UnauthenticatedError("Email already verified")
    }
    await User.findOneAndUpdate(
        { registerToken },
        { isVerified: true, registerToken: "" }
    )

    res.status(StatusCodes.OK).json({ msg: "Email verified" });
}


/** POST: http://localhost:5050/api/v1/login 
 * @param: {
  "username" : "test123",
  "password" : "admin123"
}
*/
const login = async (req, res) => {
    const { identifier, password } = req.body;
    const user = req.user

    // Validate input fields
    if (!identifier || !password) {
        throw new BadRequestError('Please provide login and password')
    }

    // Check for existing user
    if (!user) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    if (!user.isVerified) {
        throw new UnauthenticatedError('Please Verify your Email')
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    // compare password
    const token = user.createJWT()

    // Respond with success message, username, and token
    res
        .status(StatusCodes.OK)
        .json({
            message: "Login successful!",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile
            },
            token
        });
}


// GET: http://localhost:5050/api/v1/user/example123
const getUser = async (req, res) => {
    const { identifier } = req.params;
    const isEmail = identifier.includes('@'); // Check if the identifier looks like an email

    // Validate input fields
    if (!identifier) {
        throw new BadRequestError('Please provide valid email or username');
    }

    // Logic for retrieving user information based on identifier (username or email)
    if (isEmail) {
        // Handle email identifier
        // Retrieve user by email
        let user = await User.findOne({ email: identifier });
        if (!user) {
            throw new NotFoundError("Can't find User!")
        }
        const { password, ...rest } = Object.assign({}, user.toJSON());
        res.status(StatusCodes.OK).send({ rest });
    } else {
        // Handle username identifier
        // Retrieve user by username
        let user = await User.findOne({ username: identifier });
        if (!user) {
            throw new NotFoundError("Can't find User!")
        }
        const { password, ...rest } = Object.assign({}, user.toJSON());
        res.status(StatusCodes.OK).send({ rest });
    }
}


// GET: http://localhost:5050/api/v1/generateOTP
const generateOTP = (req, res) => {
    req.app.locals.OTP = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
    res.status(StatusCodes.CREATED).send({ code: req.app.locals.OTP })
}


// GET: http://localhost:5050/api/v1/verifyOTP
const verifyOTP = async (req, res) => {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null; // reset the OTP value
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(StatusCodes.CREATED).send({ msg: 'Verify Successsfully!' })
    }
    throw new BadRequestError("Invalid OTP")
} // successfully redirect user when OTP is valid


// GET: http://localhost:5050/api/v1/createResetSession
const createResetSession = async (req, res) => {
    if (req.app.locals.resetSession) {
        return res.status(StatusCodes.CREATED).send({ flag: req.app.locals.resetSession })
    }
    throw new BadRequestError('Session expired!')
} // update the password when we have valid session


// PUT: http://localhost:5050/api/v1/resetPassword
const resetPassword = async (req, res) => {
    const { password } = req.body;
    const user = req.user;

    if (!password) {
        throw new BadRequestError('Fields cannot be empty')
    }

    try {
        // ckeck if session is still active
        if (!req.app.locals.resetSession) return res.status(440).send({ error: "Session expired!" });

        const salt = await bcrypt.genSalt(10)
        const newPassword = await bcrypt.hash(password, salt)

        // update the data
        const updatePassword = await User.findByIdAndUpdate(
            { _id: user._id },
            { password: newPassword },
            { new: true, runValidators: true })

        if (!updatePassword) {
            throw new NotFoundError(`No user found with id : ${user._id}`)
        }
        res.status(StatusCodes.OK).json({ msg: "Record Updated...!" });
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).send({ error })
    }
}

module.exports = {
    register,
    verifyEmail,
    login,
    getUser,
    generateOTP,
    verifyOTP,
    createResetSession,
    resetPassword
}
