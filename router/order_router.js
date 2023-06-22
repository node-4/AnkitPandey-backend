const express = require('express');
const OrderControllers  = require('../controllers/orders_controllers')


const router = express()
router.post('/createOrders/:userId', OrderControllers.createOrders)
router.get('/getAllOrders/:userId', OrderControllers.getAllOrders)
router.post('/place-order', OrderControllers.PlaceOrder);
router.get('/fetch-order/:userId', OrderControllers.getOrders)
router.post('/position-order', OrderControllers.PositionBook);
router.post('/bracket-order', OrderControllers.BracketOrder);
router.get('/tracebook/:userId', OrderControllers.traceBook);
router.post('/squareOfposition', OrderControllers.SquareoffPosition);
router.post('/modify-order', OrderControllers.ModifyOrder);
router.post('/order-history', OrderControllers.Orderhistory);
router.get('/holding/:userId', OrderControllers.getHloiding);
router.post('/exit-bo-order', OrderControllers.ExitBOOrder);
router.post('/exit-cover-Order', OrderControllers.exitCoverOrder);
router.post('/place-co-order', OrderControllers.placeCoOrder)
router.post('/market', OrderControllers.MarketOrder);
module.exports = router;