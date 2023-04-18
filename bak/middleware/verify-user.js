const User = require('../models/User.js');
const { NotFoundError } = require('../errors/index.js')

// Middleware to verify user
const VerifyUser = async (req, res, next) => {
    const { identifier } = req.method == "GET" ? req.query : req.body;
    const isEmail = identifier.includes('@'); // Check if the identifier looks like an email

    // Logic for retrieving user information based on identifier (username or email)
    if (isEmail) {
        // Handle email identifier
        // Retrieve user by email
        let user = await User.findOne({ email: identifier });
        if (!user) {
            throw new NotFoundError("Can't find User!")
        }
        req.user = user
        next();
    } else {
        // Handle username identifier
        // Retrieve user by username
        let user = await User.findOne({ username: identifier });
        if (!user) {
            throw new NotFoundError("Can't find User!")
        }
        req.user = user
        next();
    }
}

module.exports = VerifyUser;