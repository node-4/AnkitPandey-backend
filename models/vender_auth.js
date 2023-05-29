const mongoose = require('mongoose');



const AuthVender = mongoose.Schema({
    // appCode: {
    //     type: String,
    //     unique: true
    // }, 
    userId: {
        type: String
    },
    secretkey: {
        type: String
    },
    sessionId: {
        type: String
    },
    name: {
        type: String
    },
    email: {
        type: String
    }

})


module.exports = mongoose.model('vender_auth', AuthVender);


