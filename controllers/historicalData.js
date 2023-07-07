const axios = require('axios')
const crypto = require('crypto');
const WebSocket = require('ws');
const { EventEmitter } = require('events');
const authVender = require('../models/vender_auth');
const ExchangeToken = require("../models/ExchangeToken");
const historicalData = require("../models/historicalData");
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
      let date = new Date(Date.now()).getDate();
      let month = new Date(Date.now()).getMonth() + 1;
      let year = new Date(Date.now()).getFullYear();
      let year1 = new Date(Date.now()).getFullYear() - 2;
      let current = (`${date}-${month}-${year}`).toString()
      let peri = (`${date}-${month}-${year1}`).toString()
      const toDate = new Date(current);
      const fromDate = new Date(peri);
      toDate.setHours(5);
      toDate.setMinutes(30);
      toDate.setSeconds(0);
      toDate.setMilliseconds(0);
      const toEpoch = toDate.getTime();
      fromDate.setHours(5);
      fromDate.setMinutes(30);
      fromDate.setSeconds(0);
      fromDate.setMilliseconds(0);
      const fromEpoch = fromDate.getTime();
      let findExchange = await ExchangeToken.find({ exchange: "NSE" });
      if (findExchange.length > 0) {
        for (let i = 0; i < findExchange.length; i++) {
          const data = {
            exchange: findExchange[i].exchange,
            from: 1687233600000,
            resolution: "D",
            to: 1688551200000,
            token: findExchange[i].token,
          };
          // const data = {
          //   exchange: findExchange[i].exchange,
          //   from: fromEpoch,
          //   resolution: "D",
          //   to: toEpoch,
          //   token: findExchange[i].token,
          // };
          const Data = await axios.post("https://ant.aliceblueonline.com/rest/AliceBlueAPIService/api/chart/history", data, {
            headers: {
              Authorization: 'Bearer ' + client_key + ' ' + session_id,
              'Content-Type': 'application/json',
            }
          })
          console.log("---------", Data.data.result);
          if (Data.data.result == undefined) {

          } else {
            for (let k = 0; k < Data.data.result.length; k++) {
              let findHis = await historicalData.findOne({ exchange: findExchange[i].exchange, token: findExchange[i].token, time: Data.data.result[k].time });
              if (findHis) {
                console.log("------------");
              } else {
                let obj = {
                  exchange: findExchange[i].exchange,
                  token: findExchange[i].token,
                  close: Data.data.result[k].close,
                  high: Data.data.result[k].high,
                  low: Data.data.result[k].low,
                  open: Data.data.result[k].open,
                  time: Data.data.result[k].time,
                  volume: Data.data.result[k].volume,
                }
                await historicalData.create(obj)
              }
            }
          }

        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}
setInterval(CreateSession, 10000);
