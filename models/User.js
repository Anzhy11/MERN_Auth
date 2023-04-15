const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide unique Username"],
        unique: [true, "Username Exist"],
        trim: true,
        maxlength: [20, 'username must not exceed 20 characters']
    },
    email: {
        type: String,
        required: [true, "Please provide email"],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        unique: false,
        minlength: 6,
    },
    registerToken: {
        type: String,
        minlength: 25,
        maxlength: 25,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    firstName: {
        type: String,
        trim: true,
        maxlength: [20, 'name must not exceed 20 characters']
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: [20, 'name must not exceed 20 characters']
    },
    mobile: {
        type: Number,
        maxlength: [11, 'provide 11 digit number']
    },
    address: { type: String },
    profile: { type: String }
},
    { timestamps: true }
);

UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})


UserSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, name: this.name },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_LIFETIME,
        }
    )
}

UserSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('User', UserSchema);