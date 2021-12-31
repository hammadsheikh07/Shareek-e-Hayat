const mongoose = require('mongoose')

const friendSchema = new mongoose.Schema({
    userid1:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    userid2:
    {
        type: mongoose.Schema.Types.ObjectId ,
        required: true,
        ref: 'User'
    },
})


const friends = mongoose.model('friends', friendSchema)
module.exports = friends;