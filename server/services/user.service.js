const { User } = require("../models/user")
const httpStatus = require('http-status')
const { ApiError } = require('../middleware/apiError')
const { body } = require("express-validator")
const jwt = require('jsonwebtoken')

const validateToken = async (token) => {
    return jwt.verify(token, process.env.DB_SECRET)
}

const findUserByEmail = async (email) => {
    return User.findOne({ email })
}

const findUserById = async (_id) => {
    return User.findOne({ _id })
}

const updateUserProfile = async (req) => {
    try {
        const user = await User.findOneAndUpdate({ _id: req.user._id }, { "$set": { ...req.body.data } }, { new: true })
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
        }
        return user
    } catch (error) {
        throw error
    }
}
const updateUserEmail = async (req) => {
    try {
        if (await User.emailTaken(req.body.newemail)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Sorry Email Taken')
        }
        const user = await User.findOneAndUpdate({ _id: req.user._id, email: req.user.email }, { "$set": { email: req.body.newemail, verify: false } }, { new: true })
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
        }
        return user
    } catch (error) {
        console.log(error)
        throw error
    }
}

module.exports = {
    findUserByEmail,
    findUserById,
    updateUserProfile,
    updateUserEmail,
    validateToken
}