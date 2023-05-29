const express = require('express');
const profile  = require('../controllers/profile')


const router = express()


router.get('/me/:userId', profile.getProfile)
router.get('/cash/:userId', profile.getCashBack);
router.put('/cash/:id', profile.AddPrCreateCashBeck);

router.get('/getAlluser', profile.getAlluser);
router.get('/getallCashBack', profile.getallCashBack);


module.exports = router;