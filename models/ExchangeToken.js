const mongoose = require('mongoose');


const SymbolSchema = mongoose.Schema({
    exchange: {
        type: String
    },
    token: {
        type: String
    },
    sheet: {
        type: String
    },
    Symbol: {
        type: String
    },
    tradingSymbol: {
        type: String
    }
})

module.exports = mongoose.model('ExchangeToken', SymbolSchema)