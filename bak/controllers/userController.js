const User = require('../models/User.js');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors')
const bcrypt = require('bcrypt');

/** PUT: http://localhost:5050/api/v1/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
const updateUser = async (req, res) => {
    const {
        body: { username, profile, firstName, address },
        user: { userId },
    } = req;
    update = { username, profile, firstName, address }

    // Check uniqueness
    if (username) {
        const user = await User.findOne({ username })
        if (user) {
            throw new UnauthenticatedError('Try another username')
        }
    }

    // update the data
    const updateUser = await User.findByIdAndUpdate(
        { _id: userId },
        update,
        { new: true, runValidators: true })

    if (!updateUser) {
        throw new NotFoundError(`No user found with id : ${userId}`)
    }
    res.status(StatusCodes.OK).json({ msg: "Record Updated...!", result: update })
}

/** PUT: http://localhost:5050/api/v1/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    oldPassword: '',
    password : ''
}
*/
const updatePassword = async (req, res) => {
    const {
        body: { password, oldPassword },
        user: { userId },
    } = req

    if (!password && !oldPassword) {
        throw new BadRequestError('Fields cannot be empty')
    }
    if (oldPassword === password) {
        throw new BadRequestError('your old password can not be your new password')
    }

    // find user old password
    const user = await User.findById({ _id: userId })
    const isOldPasswordCorrect = await user.comparePassword(password)
    if (isOldPasswordCorrect) {
        throw new UnauthenticatedError('Invalid Credentials')
    }

    const salt = await bcrypt.genSalt(10)
    const newPassword = await bcrypt.hash(password, salt)

    // update the data
    const updatePassword = await User.findByIdAndUpdate(
        { _id: userId },
        { password: newPassword },
        { new: true, runValidators: true })

    if (!updatePassword) {
        throw new NotFoundError(`No user found with id : ${userId}`)
    }
    res.status(StatusCodes.OK).json({ msg: "Record Updated...!" });
}

module.exports = {
    updateUser,
    updatePassword
}