const express = require('express');
const profile = require('../controllers/profile');
const multer = require("multer");
const storage = multer.diskStorage({
        destination: (req, file, cb) => {
                console.log(req.file);
                cb(null, 'upload/');
        },
        filename: (req, file, cb) => {
                cb(null, file.originalname);
        }
});
const upload = multer({ storage: storage });
const router = express()
router.get('/me/:userId', profile.getProfile)
router.get('/cash/:userId', profile.getCashBack);
router.put('/cash/:id', profile.AddPrCreateCashBeck);
router.get('/getAlluser', profile.getAlluser);
router.get('/getallCashBack', profile.getallCashBack);
router.post('/AddcashBackExcel', upload.single('file'), profile.AddcashBackExcel);
router.post('/AddExchangeTokenExcel', upload.single('file'), profile.AddExchangeTokenExcel);
router.post('/getHistorical', profile.getHistorical);
router.post('/getHistoricalbeforeLogin', profile.getHistoricalbeforeLogin);
module.exports = router;