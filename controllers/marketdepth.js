const axios = require('axios')
const crypto = require('crypto');
const WebSocket = require('ws');
const realtimeData = require('../models/SubscriptiontoDepthdata')
const { EventEmitter } = require('events');
const Orders = require('../models/orders');
const authVender = require('../models/vender_auth');
const { log } = require('console');
async function generateSessionId(userId, req, res) {
  try {
    const authCodeData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getAPIEncpkey", { userId: userId });
    const encKey = authCodeData.data.encKey
    const userData = await authVender.findOne({ userId: userId });
    const code = userData.userId + userData.secretkey + encKey
    const hash = crypto.createHash('sha256').update(code).digest('hex');
    const data = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getUserSID", {
      userId: userData.userId,
      userData: hash
    });
    // const code = userData.userId + appCode + userData.secretkey
    // const hash = crypto.createHash('sha256').update(code).digest('hex');
    // const data = await axios.post("https://a3.aliceblueonline.com/rest/AliceBlueAPIService/sso/getUserDetails", { checkSum: hash });
    const userSession = data.data.sessionID;
    const RData = {
      sessionID: userSession,
      userId: userData.userId,
      secretkey: userData.secretkey
    }
    return RData
  } catch (err) {
    console.log(err)
  }
}
async function create_sessions(clientKey, sessionId) {
  const data = { loginType: 'API' };
  const Data = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/ws/createSocketSess", data, {
    headers: {
      Authorization: 'Bearer ' + clientKey + ' ' + sessionId,
      'Content-Type': 'application/json',
    }
  })
  return Data.data
}
async function CreateSession(req, res) {
  try {
    const client_key = 764564;
    const api_key = 'phbqbEUMFmlirQuSsQUaVzTbkgusTfqqhKZgGNjtegLWtdrItIhrbzBGmGhlqpMhBqjJgssJgqqdfaZIsdNmZVVHBrpOrTyYScId';
    const appCode = "YPBDUOOFTSD97U3DGOO4"
    const session_request = await generateSessionId(client_key, api_key, appCode);
    if ('loginType' in session_request && session_request['loginType'] == null) {
      console.log(session_request['emsg']);
    } else {
      const session_id = session_request.sessionID
      const create_session = await create_sessions(client_key, session_id);
      if (create_session['stat'] == 'Ok') {
        console.log("Create Session request  :", create_session['stat']);
        const sha256_encryption1 = crypto.createHash('sha256').update(session_id).digest('hex');
        const sha256_encryption2 = crypto.createHash('sha256').update(sha256_encryption1).digest('hex');
        const ws = new WebSocket('wss://ws1.aliceblueonline.com/NorenWS/');
        ws.on('open', function open() {
          console.log('Opened connection');
          const initCon = {
            "susertoken": sha256_encryption2,
            "t": "c",
            "actid": client_key + "_API",
            "uid": client_key + "_API",
            "source": "API"
          };
          ws.send(JSON.stringify(initCon));
        });
        ws.on('message', async function incoming(data) {
          const jsonData = JSON.parse(data);
          console.log("-------market depth---------",jsonData.ts);
          if(jsonData.ts == undefined){
            console.log("--");
          }else{
            let findData = await realtimeData.findOne({ ts: jsonData.ts });
            if (findData) {
              await realtimeData.findByIdAndUpdate({ _id: findData._id }, { $set: { jsonData} }, { new: true })
            } else {
              let obj = { t: jsonData.t, pp: jsonData.pp, ml: jsonData.ml, e: jsonData.e, tk: jsonData.tk, ts: jsonData.ts, ls: jsonData.ls, ti: jsonData.ti, c: jsonData.c, lp: jsonData.lp, pc: jsonData.pc, o: jsonData.o, h: jsonData.h, l: jsonData.l, ft: jsonData.ft, ap: jsonData.ap, v: jsonData.v, bp1: jsonData.bp1, sp1: jsonData.sp1, bq1: jsonData.bp1, sq1: jsonData.ap1 }
              await realtimeData.create(jsonData)
            }
          }
          if ('s' in jsonData && jsonData['s'] == 'OK') {
            const channel = 'BSE|1#NSE|26017#NSE|26040#NSE|26009#NSE|26000#MCX|232615#MCX|235517#MCX|233042#MCX|234633#MCX|240085#NSE|5435#NSE|20182#NSE|212#NSE|11439#NSE|2328#NSE|772#NSE|14838#NSE|14428#NSE|1327#NSE|7229#NSE|1363#NSE|14366#NSE|1660#NSE|11763#NSE|10576#NSE|14977#NSE|15032#NSE|2885#NSE|3045#NSE|5948#NSE|2107#NSE|3426#NSE|11536#NSE|11915#NSE|5097';
            const dataToSend = {
              "k": channel,
              "t": 'd',
              "m": "compact_marketdata"
            };
            ws.send(JSON.stringify(dataToSend));
          }
        });
        ws.on('error', function error(error) {
          console.log(error);
        });
        ws.on('close', function close() {
          console.log('### closed ###');
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
}
setInterval(CreateSession, 50000);
exports.GetSocketData = async (req, res) => {
  try {
    const data = await realtimeData.find();
    res.status(200).json({
      message: data
    })
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err.message
    })
  }
}