const express = require('express');
const funds_Controllers  = require('../controllers/funds')


const router = express()


router.post('/get', funds_Controllers.getFunds)


module.exports = router;