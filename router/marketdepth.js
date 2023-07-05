const express = require('express');
const router = express()
require('../DepthData/BCDmarketdepth')
require('../DepthData/BFOmarketdepth')
require('../DepthData/BSEmarketdepth')
require('../DepthData/CDSmarketdepth')
require('../DepthData/NFOmarketdepth')
require('../DepthData/NSEmarketdepth')
require('../DepthData/marketdepth')




module.exports = router;