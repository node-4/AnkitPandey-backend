const express = require('express');
const Contract_master  = require('../controllers/contract_master')


const router = express()


router.post('/tendor', Contract_master.tendorperoid);
router.post('/contract_data', Contract_master.LinkforcontractData)


module.exports = router;