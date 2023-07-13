const axios = require("axios");
const crypto = require("crypto");
const { findOne } = require("../models/vender_auth");
const authVender = require("../models/vender_auth");
const cashBack = require("../models/cashback");
const xlsx = require('xlsx')
const orders = require('../models/orders');
const ExchangeToken = require("../models/ExchangeToken");
const historicalData = require("../models/historicalData");
const socket = require("../models/socket");
async function generateSessionId(userId, req, res) {
    try {
        console.log(userId);
        const authCodeData = await axios.post(
            "https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getAPIEncpkey",
            { userId: userId }
        );
        console.log(authCodeData.data.encKey);
        const encKey = authCodeData.data.encKey;
        console.log(encKey);
        const userData = await authVender.findOne({ userId: userId });
        console.log(userData);
        // if(!userData){
        //     return res.status(401).json({
        //         message: "appCode is not register resister first"
        //     })
        // }
        const code = userData.userId + userData.secretkey + encKey;
        console.log(code);
        const hash = crypto.createHash("sha256").update(code).digest("hex");
        const data = await axios.post(
            "https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getUserSID",
            {
                userId: userData.userId,
                userData: hash,
            }
        );
        console.log(data);
        const userSession = data.data.sessionID;
        console.log(data.data.sessionID);
        const RData = {
            userSession: userSession,
            userId: userData.userId,
        };

        return RData;
    } catch (err) {
        console.log(err);
    }
}
exports.getProfile = async (req, res) => {
    try {
        const userData = await generateSessionId(req.params.userId);
        console.log(userData);
        orderData = {
            exch: req.body.exch,
            symbol: req.body.symbol,
        };
        const OrderAPIData = await axios.get(
            "https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/accountDetails",
            {
                headers: {
                    Authorization: `Bearer ${userData.userId} ${userData.userSession}`,
                },
            }
        );
        res.status(200).json({
            message: OrderAPIData.data,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.getCashBack = async (req, res) => {
    try {
        const data = await cashBack.findOne({ userId: req.params.userId });
        res.status(200).json({
            message: "ok",
            result: data,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.getallCashBack = async (req, res) => {
    try {
        const data = await cashBack.find();
        res.status(200).json({
            message: "ok",
            result: data,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.AddPrCreateCashBeck = async (req, res) => {
    try {
        const casgData = await cashBack.findOne({ userId: req.params.id });
        if (casgData) {
            casgData.cash = parseInt(casgData.cash) + 50;
            casgData.save();
            return res.status(200).json({
                message: "ok",
                result: casgData,
            });
        }
        const cashData = await cashBack.create({ userId: req.params.id });
        cashData.cash = 50;
        cashData.save();
        return res.status(200).json({
            message: "ok",
            result: cashData,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.getAlluser = async (req, res) => {
    try {
        const data = await authVender.find();
        res.status(200).json({
            message: "ok",
            result: data,
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.AddcashBackExcel = async (req, res) => {
    try {
        console.log(req.file)
        const file = req.file.originalname;
        const workbook = xlsx.readFile('upload/cashback.xlsx');
        const sheet_name_list = workbook.SheetNames;
        console.log(sheet_name_list);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        console.log(data);
        for (const employee of data) {
            let findCash = await cashBack.findOne({ userId: employee.userId });
            if (findCash) {
                await cashBack.findByIdAndUpdate({ _id: findCash._id }, { $set: { cash: findCash.cash + employee.cash } }, { new: true })
                let findOrder = await orders.findOne({ orderId: employee.orderId, userId: employee.userId, });
                await orders.findByIdAndUpdate({ _id: findOrder._id }, { $set: { cash: findOrder.cash + employee.cash } }, { new: true })
            } else {
                const newEmployee = new cashBack({ userId: employee.userId, cash: employee.cash });
                let findOrder = await orders.findOne({ orderId: employee.orderId, userId: employee.userId, });
                await orders.findByIdAndUpdate({ _id: findOrder._id }, { $set: { cash: findOrder.cash + employee.cash } }, { new: true })
                await newEmployee.save();
            }
        }
        res.status(200).json({ message: "upload succefully", result: {}, });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.AddExchangeTokenExcel = async (req, res) => {
    try {
        console.log(req.file)
        const file = req.file.originalname;
        const workbook = xlsx.readFile(req.file.path);
        const sheet_name_list = workbook.SheetNames;
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            let findCash = await ExchangeToken.findOne({ sheet: req.params.sheet, exchange: data[i].Exch || data[i].exch, Symbol: data[i].Symbol || data[i].symbol, token: data[i].Token || data[i].token });
            if (findCash) {
                await ExchangeToken.findByIdAndUpdate({ _id: findCash._id }, { $set: { Symbol: data[i].Symbol || data[i].symbol, token: data[i].Token || data[i].token } }, { new: true })
            } else {
                let obj = { sheet: req.params.sheet, exchange: data[i].Exch || data[i].exch, Symbol: data[i].Symbol || data[i].symbol, token: data[i].Token || data[i].token }
                await ExchangeToken.create(obj);
            }
        }
        res.status(200).json({ message: "upload succefully", result: {}, });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};
exports.getHistorical = async (req, res) => {
    try {
        const data = {
            exchange: req.body.exchange,
            from: req.body.from, resolution: req.body.resolution, to: req.body.to, token: req.body.token,
        };
        const Data = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/chart/history", data, {
            headers: {
                Authorization: 'Bearer ' + req.body.client_key + ' ' + req.body.session_id,
                'Content-Type': 'application/json',
            }
        })
        if (Data.data.result == undefined) {

        } else {
            for (let k = 0; k < Data.data.result.length; k++) {
                let findHis = await historicalData.findOne({ exchange: req.body.exchange, resolution: req.body.resolution, token: req.body.token, time: Data.data.result[k].time });
                if (findHis) {
                    console.log("------------");
                    let findHis = await historicalData.findByIdAndUpdate({ _id: findHis._id }, { $set: { resolution: req.body.resolution, exchange: req.body.exchange, token: req.body.token, time: Data.data.result[k].time } }, { new: true });
                } else {
                    let obj = {
                        exchange: req.body.exchange,
                        token: req.body.token,
                        close: Data.data.result[k].close,
                        high: Data.data.result[k].high,
                        low: Data.data.result[k].low,
                        open: Data.data.result[k].open,
                        time: Data.data.result[k].time,
                        volume: Data.data.result[k].volume,
                        resolution: req.body.resolution
                    }
                    await historicalData.create(obj)
                }
            }
            res.status(200).json({ message: "Data get succefully", result: Data.data.result, });
        }
    } catch (err) {
        console.log(err);
    }
};
exports.getHistoricalbeforeLogin = async (req, res) => {
    try {
        const client_key = 764564;
        const api_key = 'phbqbEUMFmlirQuSsQUaVzTbkgusTfqqhKZgGNjtegLWtdrItIhrbzBGmGhlqpMhBqjJgssJgqqdfaZIsdNmZVVHBrpOrTyYScId';
        const appCode = "YPBDUOOFTSD97U3DGOO4"
        const session_request = await generateSessionId(client_key, api_key, appCode);
        console.log(session_request);
        const session_id = session_request.userSession
        const data = { exchange: req.body.exchange, from: req.body.from, resolution: req.body.resolution, to: req.body.to, token: req.body.token, };
        const Data = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/chart/history", data, {
            headers: {
                Authorization: 'Bearer ' + client_key + ' ' + session_id,
                'Content-Type': 'application/json',
            }
        })
        console.log(Data);
        if (Data.data.result == undefined) {

        } else {
            for (let k = 0; k < Data.data.result.length; k++) {
                let findHis = await historicalData.findOne({ exchange: req.body.exchange, resolution: req.body.resolution, token: req.body.token, time: Data.data.result[k].time });
                if (findHis) {
                    let findHisss = await historicalData.findByIdAndUpdate({ _id: findHis._id }, { $set: { resolution: req.body.resolution, exchange: req.body.exchange, token: req.body.token, time: Data.data.result[k].time } }, { new: true });
                } else {
                    let obj = {
                        exchange: req.body.exchange,
                        token: req.body.token,
                        close: Data.data.result[k].close,
                        high: Data.data.result[k].high,
                        low: Data.data.result[k].low,
                        open: Data.data.result[k].open,
                        time: Data.data.result[k].time,
                        volume: Data.data.result[k].volume,
                        resolution: req.body.resolution
                    }
                    await historicalData.create(obj)
                }
            }
            res.status(200).json({ message: "Data get succefully", result: Data.data.result, });
        }

    } catch (err) {
        console.log(err);
    }
};
exports.dashboard = async (req, res) => {
    try {
        const nifty50 = await socket.findOne({ e: "NSE", tk: "26000" });
        const niftyBank = await socket.findOne({ e: "NSE", tk: "26009" });
        const niftyFinService = await socket.findOne({ e: "NSE", tk: "26037" });
        const sensex = await socket.findOne({ e: "BSE", tk: "1" });
        const indiaFix = await socket.findOne({ e: "NSE", tk: "26017" });
        let obj = {
            nifty50: { lp: nifty50.lp, pc: nifty50.pc },
            niftyFinService: { lp: niftyFinService.lp, pc: niftyFinService.pc },
            niftyBank: { lp: niftyBank.lp, pc: niftyBank.pc },
            sensex: { lp: sensex.lp, pc: sensex.pc },
            indiaFix: { lp: indiaFix.lp, pc: indiaFix.pc },
        }
        res.status(200).json({ message: "ok", data: obj });
    } catch (err) {
        res.status(400).json({ message: err.message, });
    }
};