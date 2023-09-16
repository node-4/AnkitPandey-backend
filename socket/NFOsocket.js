const axios = require('axios')
const crypto = require('crypto');
const WebSocket = require('ws');
const realtimeData = require('../models/socket')
const { EventEmitter } = require('events');
const Orders = require('../models/orders');
const authVender = require('../models/vender_auth');
const ExchangeToken = require("../models/ExchangeToken");

async function generateSessionId(userId, req, res) {
  try {
    let data1 = { userId: userId.toString() };
    const authCodeData = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/customer/getAPIEncpkey", data1);
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
    const api_key = 'MG8uyImXonhkWs0bixScj7uGuSdLNhm6KJqlzlZH585BxdipPYnXp6rSL0WC0C9EhlQNdJ2Z0ey35xaVBLHkYQqeE44NvVDVMn9DgTy7yi6xJS2rzQ3nyC2o3WXtYddd';
    const appCode = "sNrvCklLaqoUaXF"; const session_request = await generateSessionId(client_key, api_key, appCode);
    if ('loginType' in session_request && session_request['loginType'] == null) {
      console.log(session_request['emsg']);
    } else {
      const session_id = session_request.sessionID
      // "FYkJ6YdNp2lnzZNJmZCVy1X8DGkFAExF4T0eL3BLiduAjIAb0LLueLH9jv5kLOqlS7p2rx3sCs5xnS8oHndhn47PUcjqnBORE4ZOyQMe1mZMv0R6VdBTVM7daGqoatmgGhXq8PBMMulnXMeuJlFyCD7mhL6ktJnxF07paeHYsNBQITNErfgLiPTeKBcdzEFUyeSF1qNOZYkr0veUGYq1tSSGo90ijRTDKTxk1nmFKgUL3IORHoU15IvWNeJE241O"
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
          console.log("-------socket---------", jsonData);
          if (jsonData.ts == undefined) {
            console.log("-");
          } else {
            let findData = await realtimeData.findOne({ $and: [{ $or: [{ ts: jsonData.ts, e: jsonData.e }, { t: jsonData.t, e: jsonData.e }] }] });
            if (findData) {
              await realtimeData.findByIdAndUpdate({ _id: findData._id }, { $set: { t: jsonData.t, pp: jsonData.pp, ml: jsonData.ml, e: jsonData.e, tk: jsonData.tk, ts: jsonData.ts, ls: jsonData.ls, ti: jsonData.ti, c: jsonData.c, lp: jsonData.lp, pc: jsonData.pc, o: jsonData.o, h: jsonData.h, l: jsonData.l, ft: jsonData.ft, ap: jsonData.ap, v: jsonData.v, bp1: jsonData.bp1, sp1: jsonData.sp1, bq1: jsonData.bp1, sq1: jsonData.ap1 } }, { new: true })
            } else {
              let obj = { t: jsonData.t, pp: jsonData.pp, ml: jsonData.ml, e: jsonData.e, tk: jsonData.tk, ts: jsonData.ts, ls: jsonData.ls, ti: jsonData.ti, c: jsonData.c, lp: jsonData.lp, pc: jsonData.pc, o: jsonData.o, h: jsonData.h, l: jsonData.l, ft: jsonData.ft, ap: jsonData.ap, v: jsonData.v, bp1: jsonData.bp1, sp1: jsonData.sp1, bq1: jsonData.bp1, sq1: jsonData.ap1 }
              await realtimeData.create(obj)
            }
          }
          if ('s' in jsonData && jsonData['s'] == 'OK') {
            const dataToSend1 = {
              "k": "",
              "t": "h"
            }
            ws.send(JSON.stringify(dataToSend1));
            let findExchange = await ExchangeToken.find({ exchange: "NFO", sheet: "NFO" });
            if (findExchange.length > 0) {
              for (let i = 0; i < findExchange.length; i++) {
                const channel = `${findExchange[i].exchange}|${findExchange[i].token}`
                const dataToSend = {
                  "k": channel,
                  "t": 't'
                };
                ws.send(JSON.stringify(dataToSend));
              }
            }
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




















/*
const WebSocket = require('ws');
const crypto = require('crypto');
const { EventEmitter } = require('events');
const { createSession, get_session, invalid_sess } = require('./modules');

// Enter the client code
const client_key = '';

//Enter the session Id
const api_key = '';

(async () => {
  const session_request = await get_session(client_key, api_key);
  if ('loginType' in session_request && session_request['loginType'] == null) {
    console.log(session_request['emsg']);
  } else {
    const session_id = session_request['sessionID'];
    const invalid_session = await invalid_sess(client_key, session_id);
    if (invalid_session['stat'] == 'Ok') {
      console.log("Invalid Session request :", invalid_session['stat']);
      const create_session = await createSession(client_key, session_id);
      if (create_session['stat'] == 'Ok') {
        console.log("Create Session request  :", create_session['stat']);
        const sha256_encryption1 = crypto.createHash('sha256').update(session_id).digest('hex');
        const sha256_encryption2 = crypto.createHash('sha256').update(sha256_encryption1).digest('hex');
        const emitter = new EventEmitter();

        function on_message(data) {
          console.log(data);
          data = JSON.parse(data);
          if ('s' in data && data['s'] == 'OK') {
            const channel = 'BSE|1#NSE|26017#NSE|26040#NSE|26009#NSE|26000#MCX|232615#MCX|235517#MCX|233042#MCX|234633#MCX|240085#NSE|5435#NSE|20182#NSE|212#NSE|11439#NSE|2328#NSE|772#NSE|14838#NSE|14428#NSE|1327#NSE|7229#NSE|1363#NSE|14366#NSE|1660#NSE|11763#NSE|10576#NSE|14977#NSE|15032#NSE|2885#NSE|3045#NSE|5948#NSE|2107#NSE|3426#NSE|11536#NSE|11915#NSE|5097';
            const message = {
              "k": channel,
              "t": 't',
              "m": "compact_marketdata"
            };
            ws.send(JSON.stringify(message));
          }
        }

        function on_error(error) {
          console.error(error);
        }

        function on_close(close_status_code, close_msg) {
          console.log("### closed ###");
          emitter.emit('close', close_status_code, close_msg);
        }

        function on_open() {
          console.log("Opened connection");
          const initCon = {
            "susertoken": sha256_encryption2,
            "t": "c",
            "actid": client_key + "_API",
            "uid": client_key + "_API",
            "source": "API"
          };
          ws.send(JSON.stringify(initCon));
        }

        const ws = new WebSocket("wss://ws1.aliceblueonline.com/NorenWS/");
        ws.on('open', on_open);
        ws.on('message', on_message);
        ws.on('error', on_error);
        ws.on('close', on_close);

        // Set dispatcher to automatic reconnection
        ws.on('close', (close_status_code, close_msg) => {
          rel.dispatch();
        });

        // Keyboard Interrupt
        process.on('SIGINT', () =>
*/
