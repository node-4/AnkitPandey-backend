const axios = require('axios');
const crypto = require('crypto');
const AuthVender = require('../models/vender_auth');
const symbol = require('../models/symbel_model');
const xlsx = require('xlsx')

exports.getVendorSessionId = async (req, res) => {
  try {
    const authCodeData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getAPIEncpkey", { userId: req.body.userId });
    // console.log(authCodeData)
    const encKey = authCodeData.data.encKey
    const userData1 = await AuthVender.findOne({ userId: req.body.userId });
    if (userData1) {
      const code = userData1.userId + userData1.secretkey + encKey
      console.log(code)
      const hash = crypto.createHash('sha256').update(code).digest('hex');
      const data = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getUserSID", {
        userId: userData1.userId,
        userData: hash
      });
      return res.status(200).json({
        message: data.data,
        userId: req.body.userId
      })
    } else {
      const userId = req.body.userId
      const secretkey = req.body.key
      const code = userId + secretkey + encKey
      const hash = crypto.createHash('sha256').update(code).digest('hex');
      const data = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getUserSID", {
        userId: req.body.userId,
        userData: hash
      });
      console.log(data)
      const userData = {
        userId: req.body.userId,
        secretkey: req.body.key,
        sessionId: data.data.userSession
      }
      console.log(userData)
      const Data = await AuthVender.create(userData)
      res.status(200).json({
        message: data.data,
        userId: req.body.userId
      })
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message })
  }
}


exports.AddExcel = async (req, res) => {
  try {
    console.log(req.file.originalname)
    const file = req.file.originalname;
    console.log(file);
    const workbook = xlsx.readFile('NSE-.xlsx');
    const sheet_name_list = workbook.SheetNames;
    console.log(sheet_name_list);
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    console.log(data);
    for (const employee of data) {
      const newEmployee = new symbol({
        symbol: employee.Symbol
      });

      // Validate employee data
      // const { error } = newEmployee.validate();
      // if (error) {
      //   throw new Error(error.details[0].message);
      // }

      // Save employee data to MongoDB
      await newEmployee.save();
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message,
    });
  }
};


exports.getAllSymbol = async(req,res) => {
  try{
    const result = await symbol.find();
    res.status(200).json({
      message: "ok",
      result: result
    })
  }catch(err){
    console.log(err);
    res.status(400).json({
      message: err.message,
    });
  }
}