const axios = require('axios')
const crypto = require('crypto');
const { findOne } = require('../models/vender_auth');
const authVender = require('../models/vender_auth')




async function generateSessionId(userId, req,res){
    try{
        console.log(userId)
        const authCodeData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getAPIEncpkey", {userId: userId });
        console.log(authCodeData.data.encKey)
        const encKey = authCodeData.data.encKey
        const userData = await authVender.findOne({userId: userId});
        // if(!userData){
        //     return res.status(401).json({
        //         message: "appCode is not register resister first"
        //     })
        // }
        const code =userData.userId+userData.secretkey+encKey
        const hash = crypto.createHash('sha256').update(code).digest('hex');
        const data = await axios.post("https://a3.aliceblueonline.com/rest/AliceBlueAPIService/sso/getUserDetails", {checkSum: hash});
        const   userSession = data.data.sessionID;
        const RData = {
            userSession: userSession,
            userId : userData.userId
        }

        return RData
    }catch(err){
       console.log(err)
    }
}


exports.tendorperoid = async(req,res) => {
    try{
        const userData = await  generateSessionId(req.body.userId)
   console.log(userData)
     orderData = {
        exch: req.body.exch,
        symbol: req.body.symbol
     }
    const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/ScripDetails/getSecurityInfo", orderData,{
        headers:{
            "Authorization": `Bearer ${userData.userId} ${userData.userSession}` ,
        } 
    })
    res.status(200).json({
        message: OrderAPIData.data
    })
    }catch(err){
        console.log(err);
        res.status(400).json({
            message: err.message
        })
    }
}


exports.LinkforcontractData = async(req,res) => {
    try{
        const userData = await  generateSessionId(req.body.userId)
        console.log(userData)
          orderData = {
             exch: req.body.exch,
          }
         const OrderAPIData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/contract/getMasterContractsCSVLink", orderData,{
             headers:{
                 "Authorization": `Bearer ${userData.userId} ${userData.userSession}` ,
             } 
         })
         res.status(200).json({
             message: OrderAPIData.data
         })
    }catch(err){
        res.status(400).json({
            message: err.message
        })
    }
}