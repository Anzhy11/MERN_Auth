const User = require('../models/User.js');
const { NotFoundError } = require('../errors/index.js')

// Middleware to verify user
const VerifyEmail = async (req, res, next) => {
    const { userEmail } = req.body;

    // Retrieve user by email
    let user = await User.findOne({ email: userEmail });
    if (!user) {
        throw new NotFoundError("Can't find User!")
    }
    req.user = user
    next();
}

module.exports = VerifyEmail;