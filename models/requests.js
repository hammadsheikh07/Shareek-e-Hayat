const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
    senderid:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    recieverid:
    {
        type: mongoose.Schema.Types.ObjectId ,
        required: true,
        ref: 'User'
    },
})


const requests = mongoose.model('requests', requestSchema)
module.exports = requests;