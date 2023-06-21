const axios = require('axios')
const crypto = require('crypto');
const Orders = require('../models/orders');
const { findOne } = require('../models/vender_auth');
const cashback = require('../models/cashback')
const authVender = require('../models/vender_auth')




async function generateSessionId(userId, req, res) {
    try {
        console.log(userId)
        const authCodeData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getAPIEncpkey", { userId: userId });
        console.log(authCodeData.data.encKey)
        const encKey = authCodeData.data.encKey
        const userData = await authVender.findOne({ userId: userId });
        // if(!userData){
        //     return res.status(401).json({
        //         message: "appCode is not register resister first"
        //     })
        // }
        const code = userData.userId + userData.secretkey + encKey
        const hash = crypto.createHash('sha256').update(code).digest('hex');
        const data = await axios.post("https://a3.aliceblueonline.com/rest/AliceBlueAPIService/sso/getUserDetails", { checkSum: hash });
        const userSession = data.data.sessionID;
        console.log("userSession----------------",userSession)
        const RData = {
            userSession: userSession,
            userId: userData.userId
        }

        return RData
    } catch (err) {
        console.log(err)
    }
}



exports.PlaceOrder = async (req, res) => {
    try {
        const userData = await generateSessionId(req.body.userId)
        console.log(userData)
        let orderData = [{
            complexty: req.body.complexty,
            discqty: req.body.discqty,
            exch: req.body.exch,
            pCode: req.body.pCode,
            prctyp: req.body.pCode,
            price: req.body.price,
            qty: req.body.qty,
            ret: req.body.ret,
            symbol_id: req.body.symbol_id,
            trading_symbol: req.body.trading_symbol,
            transtype: req.body.transtype,
            trigPrice: req.body.trigPrice
        }]
        const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/placeOrder/executePlaceOrder", orderData, {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        if (req.body.transtype === "BUY") {
            const cashbackData = await cashback.findOne({ userId: req.body.paramsid });
            if (cashbackData) {
                await cashback.updateOne({ _id: cashbackData._id }, {
                    cash: cashback.cash + 50
                })
            } else {
                await cashback.create({
                    appCode: req.body.appCode,
                    userId: userData.userId,
                    cash: 0
                })

            }
        }
        res.status(200).json({
            message: OrderAPIData.data,
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}


exports.getOrders = async (req, res) => {
    try {
        const userData = await generateSessionId(req.params.userId);
        const OrderAPIData = await axios.get("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/placeOrder/fetchOrderBook", {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        console.log(OrderAPIData)
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({message: err.message})
    }
}

exports.PositionBook = async (req, res) => {
    try {
        const userData = await generateSessionId(req.body.userId)
        const query = {
            "ret": req.body.ret
        }
        const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/positionAndHoldings/positionBook", query, {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}


exports.BracketOrder = async (req, res) => {
    try {
        const userData = await generateSessionId(req.body.userId);
        const orderData = [{
            complexty: req.body.complexty,
            discqty: req.body.discqty,
            exch: req.body.exch,
            pCode: req.body.pCode,
            prctyp: req.body.prctyp,
            price: req.body.price,
            stopLoss: req.body.stopLoss,
            qty: req.body.qty,
            ret: req.body.ret,
            target: req.body.target,
            symbol_id: req.body.symbol_id,
            trading_symbol: req.body.trading_symbol,
            trailing_stop_loss: req.body.trailing_stop_loss,
            transtype: req.body.transtype,
            trigPrice: req.body.trigPrice,
            orderTag: req.body.orderTag
        }]
        const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/placeOrder/executePlaceOrder", orderData, {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}

exports.traceBook = async (req, res) => {
    try {
        const userData = await generateSessionId(req.params.userId)
        const OrderAPIData = await axios.get("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/placeOrder/fetchTradeBook", {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message
        })
    }
}

exports.SquareoffPosition = async (req, res) => {
    try {
        const userData = await generateSessionId(req.body.userId)
        console.log(userData)
        const orderData = {
            exchSeg: req.body.exchSeg,
            pCode: req.body.pCode,
            netQty: req.body.netQty,
            tockenNo: req.body.tockenNo,
            symbol: req.body.symbol
        }
        const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/positionAndHoldings/sqrOofPosition", orderData, {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}

exports.ModifyOrder = async (req, res) => {
    try {
        const userData = await generateSessionId(req.body.userId)
        console.log(userData)
        const orderData = {
            discqty: req.body.discqty,
            exch: req.body.exch,
            nestOrderNumber: req.body.nestOrderNumber,
            filledQuantity: req.body.filledQuantity,
            prctyp: req.body.pCode,
            price: req.body.price,
            qty: req.body.qty,
            trading_symbol: req.body.trading_symbol,
            trigPrice: req.body.trigPrice
        }
        const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/placeOrder/modifyOrder", orderData, {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}


exports.Orderhistory = async (req, res) => {
    try {
        const userData = await generateSessionId(req.body.userId)
        const orderData = {
            nestOrderNumber: req.body.nestOrderNumber
        }
        const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/placeOrder/orderHistory", orderData, {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}

exports.getHloiding = async (req, res) => {
    try {
        const userData = await generateSessionId(req.params.userId)
        const OrderAPIData = await axios.get("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/positionAndHoldings/holdings", {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}

exports.ExitBOOrder = async (req, res) => {
    try {
        const userData = await generateSessionId(req.body.userId)
        const orderData = {
            nestOrderNumber: req.body.nestOrderNumber,
            symbolOrderId: req.body.symbolOrderId,
            status: req.body.status
        }
        const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/placeOrder/exitBracketOrder", orderData, {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        console.log(OrderAPIData)
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}


exports.exitCoverOrder = async (req, res) => {
    try {
        const userData = await generateSessionId(req.body.userId)
        const orderData = {
            nestOrderNumber: req.body.nestOrderNumber,
        }
        const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/placeOrder/exitCoverOrder", orderData, {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}


exports.placeCoOrder = async (req, res) => {
    try {
        const userData = await generateSessionId(req.body.userId)
        const orderData = [{
            complexty: req.body.complexty,
            discqty: req.body.discqty,
            exch: req.body.exch,
            pCode: req.body.pCode,
            prctyp: req.body.pCode,
            price: req.body.price,
            qty: req.body.qty,
            ret: req.body.ret,
            symbol_id: req.body.symbol_id,
            trading_symbol: req.body.trading_symbol,
            transtype: req.body.transtype,
            trigPrice: req.body.trigPrice
        }]
        const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/placeOrder/executePlaceOrder", orderData, {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}

exports.MarketOrder = async (req, res) => {
    try {
        const userData = await generateSessionId(req.body.userId)
        const orderData = [{
            complexty: req.body.complexty,
            discqty: req.body.discqty,
            exch: req.body.exch,
            pCode: req.body.pCode,
            prctyp: req.body.prctyp,
            price: req.body.price,
            qty: req.body.qty,
            ret: req.body.ret,
            symbol_id: req.body.symbol_id,
            trading_symbol: req.body.trading_symbol,
            transtype: req.body.transtype,
            trigPrice: req.body.trigPrice
        }]
        const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/placeOrder/executePlaceOrder", orderData, {
            headers: {
                "Authorization": `Bearer ${userData.userId} ${userData.userSession}`,
            }
        })
        res.status(200).json({
            message: OrderAPIData.data
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}
exports.createOrders = async (req, res) => {
    try {
       
     
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
}
