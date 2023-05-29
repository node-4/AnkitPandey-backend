const mongoose = require('mongoose')


const realtimeData = mongoose.Schema({
    t: {
        type: String
    },
    e: {
        type: String
    },
    tk: {
        type: String
    },
    ft: {
        type: String
    },
    bq1: {
        type: String
    },
    sp1: {
        type: String
    },
    sq1: {
        type: String
    }, 
    v: {
        type: String
    },
    pc: {
        type: String
    }, 
    bp1: {
        type: String
    }, 
    lp: {
        type: String
    }, 
    c: {
        type: String 
    },
    h:{
        type: String
    }
})

module.exports = mongoose.model('websocketData', realtimeData)

/*
    t: 'tk',
  pp: '2',
  ml: '1',
  e: 'NSE',
  tk: '5097',
  ts: 'ZOMATO-EQ',
  ls: '1',
  ti: '0.05',
  c: '50.75',
  lp: '50.75',
  pc: '0.00',
  o: '51.50',
  h: '52.20',
  l: '50.55',
  ft: '1678876169',
  ap: '51.06',
  v: '38763143',
  bp1: '50.75',
  sp1: '0.00',
  bq1: '16983',
  sq1: '0'
  */