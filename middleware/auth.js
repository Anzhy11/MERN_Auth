const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

/** auth middleware */
const Auth = async (req, res, next) => {
    // check header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthenticatedError('Authentication invalid')
    }
    const token = authHeader.split(' ')[1];

    try {
        // Verify and decode the JWT token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Set the decoded token data to the request object for future use
        req.user = { userId: decodedToken.userId, name: decodedToken.name }

        next();
    } catch (error) {
        throw new UnauthenticatedError('Authentication invalid')
    }
};


const localVariables = (req, res, next) => {
    req.app.locals = {
        OTP: null,
        resetSession: false
    }
    next()
}

module.exports = { Auth, localVariables }
