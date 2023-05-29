const mongoose = require('mongoose');


const SymbolSchema = mongoose.Schema({
    symbol: {
        type: String
    }
})

module.exports = mongoose.model('symbolSchema', SymbolSchema)