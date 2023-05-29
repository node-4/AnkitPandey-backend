const express = require('express');
const authControllers = require('../controllers/authVendor');
const multer = require("multer");


const router = express()


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
         console.log(req.file)
        cb(null, 'upload/');
    },
    filename: (req, file, cb) => {
        cb(null,file.originalname);
    }
  });
  const upload = multer({ storage: storage });
  

router.post('/auth', authControllers.getVendorSessionId)

router.post('/excel', upload.single('file'), authControllers.AddExcel);

router.get('/all', authControllers.getAllSymbol)

module.exports = router;