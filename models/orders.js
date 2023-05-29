const mongoose = require('mongoose');

const OrderManagement = mongoose.Schema({
    complexty: {
        type: String, 
        require: true
    }, 
    discqty: {
        type: String,
        require: true
    },
    exch: {
        type: String, 
        require: true
    },
    pCode: {
        type: String, 
        require: true
    },
    price: {
        type: String, 

    },
    qty: {
        type: String, 
    },
    ret: {
        type: String
    },
    symbol_id: {
        type: String
    }, 
    trading_symbol: {
        type: String
    },
    transtype: {
        type: String
    },
    trigPrice: {
        type: String
    }
})

module.exports = mongoose.model('orders',OrderManagement)