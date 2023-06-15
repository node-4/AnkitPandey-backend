const axios = require("axios");
const crypto = require("crypto");
const { findOne } = require("../models/vender_auth");
const authVender = require("../models/vender_auth");
const cashBack = require("../models/cashback");
const xlsx = require('xlsx')

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
            } else {
                const newEmployee = new cashBack({
                    userId: employee.userId,
                    cash: employee.cash
                });
                await newEmployee.save();
            }
        }
        res.status(200).json({message: "upload succefully",result: {},});
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
};