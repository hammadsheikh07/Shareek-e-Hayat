const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true
       },
    email: {
        type : String,
        required : true
    },
    age:
    {
        type: Number,
        required : true
    },
    City: {
        type : String,
        required : true
    },
    Religion: {
        type : String,
        required : true
    },
    Cast: {
        type : String,
        required : true
    },
    password: {
        type : String,
        required : true
    },
    date: {
        type : Date
    }
})


const User = mongoose.model('User' , UserSchema)

module.exports = User;
