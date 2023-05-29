const express = require('express');
const profile  = require('../controllers/socket')


const router = express()


 router.get('/session',profile.GetSocketData)


module.exports = router;