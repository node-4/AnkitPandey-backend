const mongoose = require('mongoose')
const realtimeData = mongoose.Schema({
    exchange: {
        type: String
    },
    token: {
        type: String
    },
    close: {
        type: Number
    },
    high: {
        type: Number
    },
    low: {
        type: Number
    },
    open: {
        type: Number
    },
    resolution: {
        type: String
    },
    time: {
        type: String
    },
    volume: {
        type: Number
    },
})
module.exports = mongoose.model('historicalData', realtimeData)