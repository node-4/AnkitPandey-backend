const { validateUser } = require("../middlewares");
const auth = require("../controllers/admin.controller");
const { authJwt, authorizeRoles } = require("../middlewares");
var multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads"); }, filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); },
});
const express = require('express');
const upload = multer({ storage: storage });
const router = express()
router.post("/registration", auth.registration);
router.post("/login", auth.signin);
router.put("/update", [authJwt.verifyToken], auth.update);
router.get("/getAllOrders", auth.getAllOrders);
module.exports = router;