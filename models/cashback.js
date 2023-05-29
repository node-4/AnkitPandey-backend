const mongoose = require('mongoose');


const CashBacks = mongoose.Schema({
    userId: {
        type: String
    },
    cash : {
        type: Number, 
        default: 0
    }
})

module.exports = mongoose.model('cashback', CashBacks)