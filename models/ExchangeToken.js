const mongoose = require('mongoose');


const SymbolSchema = mongoose.Schema({
    exchange: {
        type: String
    },
    token: {
        type: String
    },
    Symbol:{
        type: String
    }
})

module.exports = mongoose.model('ExchangeToken', SymbolSchema)