const express = require('express');
const router = express()
const profile = require('../socket/socket')
const BFOsocket = require('../socket/BFOsocket');
const BSEsocket = require('../socket/BSEsocket');
const NFOsocket = require('../socket/NFOsocket');
const bCDsocket = require('../socket/bCDsocket');
const cdssocket = require('../socket/cdssocket');
const mcxsocket = require('../socket/mcxsocket');
const indicessocket = require('../socket/indicessocket');

router.get('/session', profile.GetSocketData)
module.exports = router;