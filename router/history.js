const express = require('express');
const history = require('../controllers/charthistory')


const router = express()


router.post('/', history.charthistory)


module.exports = router;