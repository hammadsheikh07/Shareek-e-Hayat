const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    age:
    {
        type: Number,
        required: true
    },
    City: {
        type: String,
        required: true
    },
    Religion: {
        type: String,
        required: true
    },
    Cast: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profile_pic:
    {
        type: String,
        required: true
    }
})


UserSchema.index({ firstname: "text", lastname: "text" });


const User = mongoose.model('User', UserSchema)
module.exports = User;