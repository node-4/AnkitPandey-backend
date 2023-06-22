const axios = require('axios')
const crypto = require('crypto');
const Orders = require('../models/orders');
const { findOne } = require('../models/vender_auth');
const cashback = require('../models/cashback')
const authVender = require('../models/vender_auth');
const orders = require('../models/orders');

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
        console.log("userSession----------------", userSession)
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
        res.status(400).json({ message: err.message })
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
        let Order = []
        for (let i = 0; i < req.body.data.length; i++) {
            let orderId = await reffralCode();
            let obj = {
                orderId: orderId,
                userId: req.params.userId,
                Prc: req.body.data[i].Prc,
                RequestID: req.body.data[i].RequestID,
                Cancelqty: req.body.data[i].Cancelqty,
                discQtyPerc: req.body.data[i].discQtyPerc,
                customText: req.body.data[i].customText,
                Mktpro: req.body.data[i].Mktpro,
                defmktproval: req.body.data[i].defmktproval,
                optionType: req.body.data[i].optionType,
                usecs: req.body.data[i].usecs,
                mpro: req.body.data[i].mpro,
                Qty: req.body.data[i].Qty,
                ordergenerationtype: req.body.data[i].ordergenerationtype,
                Unfilledsize: req.body.data[i].Unfilledsize,
                orderAuthStatus: req.body.data[i].orderAuthStatus,
                Usercomments: req.body.data[i].Usercomments,
                ticksize: req.body.data[i].ticksize,
                Prctype: req.body.data[i].Prctype,
                Status: req.body.data[i].Status,
                Minqty: req.body.data[i].Minqty,
                orderCriteria: req.body.data[i].orderCriteria,
                Sym: req.body.data[i].Sym,
                multiplier: req.body.data[i].multiplier,
                Exseg: req.body.data[i].Exseg,
                ExchOrdID: req.body.data[i].ExchOrdID,
                ExchConfrmtime: req.body.data[i].ExchConfrmtime,
                SyomOrderId: req.body.data[i].SyomOrderId,
                Pcode: req.body.data[i].Pcode,
                Dscqty: req.body.data[i].Dscqty,
                Exchange: req.body.data[i].Exchange,
                Ordvaldate: req.body.data[i].Ordvaldate,
                accountId: req.body.data[i].accountId,
                exchangeuserinfo: req.body.data[i].exchangeuserinfo,
                Avgprc: req.body.data[i].Avgprc,
                Trgprc: req.body.data[i].Trgprc,
                Trantype: req.body.data[i].Trantype,
                bqty: req.body.data[i].bqty,
                Fillshares: req.body.data[i].Fillshares,
                Trsym: req.body.data[i].Trsym,
                AlgoCategory: req.body.data[i].AlgoCategory,
                strikePrice: req.body.data[i].strikePrice,
                sipindicator: req.body.data[i].sipindicator,
                AlgoID: req.body.data[i].AlgoID,
                reporttype: req.body.data[i].reporttype,
                noMktPro: req.body.data[i].noMktPro,
                BrokerClient: req.body.data[i].BrokerClient,
                OrderUserMessage: req.body.data[i].OrderUserMessage,
                decprec: req.body.data[i].decprec,
                ExpDate: req.body.data[i].ExpDate,
                COPercentage: req.body.data[i].COPercentage,
                marketprotectionpercentage: req.body.data[i].marketprotectionpercentage,
                ExpSsbDate: req.body.data[i].ExpSsbDate,
                Nstordno: req.body.data[i].Nstordno,
                OrderedTime: req.body.data[i].OrderedTime,
                modifiedBy: req.body.data[i].modifiedBy,
                RejReason: req.body.data[i].RejReason,
                Scripname: req.body.data[i].Scripname,
                stat: req.body.data[i].stat,
                orderentrytime: req.body.data[i].orderentrytime,
                PriceDenomenator: req.body.data[i].PriceDenomenator,
                panNo: req.body.data[i].panNo,
                RefLmtPrice: req.body.data[i].RefLmtPrice,
                PriceNumerator: req.body.data[i].PriceNumerator,
                ordersource: req.body.data[i].ordersource,
                token: req.body.data[i].token,
                GeneralDenomenator: req.body.data[i].GeneralDenomenator,
                Validity: req.body.data[i].Validity,
                series: req.body.data[i].series,
                InstName: req.body.data[i].InstName,
                GeneralNumerator: req.body.data[i].GeneralNumerator,
                user: req.body.data[i].user,
                remarks: req.body.data[i].remarks,
                iSinceBOE: req.body.data[i].iSinceBOE,
                complexty: req.body.data[i].complexty,
                discqty: req.body.data[i].discqty,
                exch: req.body.data[i].exch,
                trading_symbol: req.body.data[i].trading_symbol,
                symbol_id: req.body.data[i].symbol_id,
                pCode: req.body.data[i].pCode,
                prctyp: req.body.data[i].prctyp,
                price: req.body.data[i].price,
                qty: req.body.data[i].qty,
                ret: req.body.data[i].ret,
                transtype: req.body.data[i].transtype,
                trigPrice: req.body.data[i].trigPrice
            }
            let FindOrder = await Orders.findOne({ userId: req.params.userId, Prc: req.body.data[i].Prc, RequestID: req.body.data[i].RequestID, Cancelqty: req.body.data[i].Cancelqty, discQtyPerc: req.body.data[i].discQtyPerc, customText: req.body.data[i].customText, Mktpro: req.body.data[i].Mktpro, defmktproval: req.body.data[i].defmktproval, optionType: req.body.data[i].optionType, usecs: req.body.data[i].usecs, mpro: req.body.data[i].mpro, Qty: req.body.data[i].Qty, ordergenerationtype: req.body.data[i].ordergenerationtype, Unfilledsize: req.body.data[i].Unfilledsize, orderAuthStatus: req.body.data[i].orderAuthStatus, Usercomments: req.body.data[i].Usercomments, ticksize: req.body.data[i].ticksize, Prctype: req.body.data[i].Prctype, Status: req.body.data[i].Status, Minqty: req.body.data[i].Minqty, orderCriteria: req.body.data[i].orderCriteria, Sym: req.body.data[i].Sym, multiplier: req.body.data[i].multiplier, Exseg: req.body.data[i].Exseg, ExchOrdID: req.body.data[i].ExchOrdID, ExchConfrmtime: req.body.data[i].ExchConfrmtime, SyomOrderId: req.body.data[i].SyomOrderId, Pcode: req.body.data[i].Pcode, Dscqty: req.body.data[i].Dscqty, Exchange: req.body.data[i].Exchange, Ordvaldate: req.body.data[i].Ordvaldate, accountId: req.body.data[i].accountId, exchangeuserinfo: req.body.data[i].exchangeuserinfo, Avgprc: req.body.data[i].Avgprc, Trgprc: req.body.data[i].Trgprc, Trantype: req.body.data[i].Trantype, bqty: req.body.data[i].bqty, Fillshares: req.body.data[i].Fillshares, Trsym: req.body.data[i].Trsym, AlgoCategory: req.body.data[i].AlgoCategory, strikePrice: req.body.data[i].strikePrice, sipindicator: req.body.data[i].sipindicator, AlgoID: req.body.data[i].AlgoID, reporttype: req.body.data[i].reporttype, noMktPro: req.body.data[i].noMktPro, BrokerClient: req.body.data[i].BrokerClient, OrderUserMessage: req.body.data[i].OrderUserMessage, decprec: req.body.data[i].decprec, ExpDate: req.body.data[i].ExpDate, COPercentage: req.body.data[i].COPercentage, marketprotectionpercentage: req.body.data[i].marketprotectionpercentage, ExpSsbDate: req.body.data[i].ExpSsbDate, Nstordno: req.body.data[i].Nstordno, OrderedTime: req.body.data[i].OrderedTime, modifiedBy: req.body.data[i].modifiedBy, RejReason: req.body.data[i].RejReason, Scripname: req.body.data[i].Scripname, stat: req.body.data[i].stat, orderentrytime: req.body.data[i].orderentrytime, PriceDenomenator: req.body.data[i].PriceDenomenator, panNo: req.body.data[i].panNo, RefLmtPrice: req.body.data[i].RefLmtPrice, PriceNumerator: req.body.data[i].PriceNumerator, ordersource: req.body.data[i].ordersource, token: req.body.data[i].token, GeneralDenomenator: req.body.data[i].GeneralDenomenator, Validity: req.body.data[i].Validity, series: req.body.data[i].series, InstName: req.body.data[i].InstName, GeneralNumerator: req.body.data[i].GeneralNumerator, user: req.body.data[i].user, remarks: req.body.data[i].remarks, iSinceBOE: req.body.data[i].iSinceBOE, complexty: req.body.data[i].complexty, discqty: req.body.data[i].discqty, exch: req.body.data[i].exch, trading_symbol: req.body.data[i].trading_symbol, symbol_id: req.body.data[i].symbol_id, pCode: req.body.data[i].pCode, prctyp: req.body.data[i].prctyp, price: req.body.data[i].price, qty: req.body.data[i].qty, ret: req.body.data[i].ret, transtype: req.body.data[i].transtype, trigPrice: req.body.data[i].trigPrice });
            if (!FindOrder) {
                const Data = await Orders.create(obj)
                Order.push(Data)
            } else {
                Order.push(FindOrder)
            }
        }
        res.status(200).json({ data: Order })
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
};
exports.getAllOrders = async (req, res) => {
    try {
        let Order = await orders.find({ userId: req.params.userId });
        if (Order.length == 0) {
            res.status(404).json({ Status: 404, message: "Order Detail not found", data: {} })
        }
        res.status(200).json({ Status: 200, message: "Order Detail fetch", data: Order })

    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message })
    }
}
const reffralCode = async () => {
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let OTP = '';
    for (let i = 0; i < 9; i++) {
        OTP += digits[Math.floor(Math.random() * 36)];
    }
    return OTP;
}