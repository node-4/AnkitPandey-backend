const mongoose = require('mongoose')


const realtimeData = mongoose.Schema({
    t: {
        type: String
    },
    pp: {
        type: String
    },
    ml: {
        type: String
    },
    e: {
        type: String
    },
    tk: {
        type: String
    },
    ts: {
        type: String
    },
    ls: {
        type: String
    },
    ti: {
        type: String
    },
    c: {
        type: String
    },
    lp: {
        type: String
    },
    pc: {
        type: String
    },
    o: {
        type: String
    },
    h: {
        type: String
    },
    l: {
        type: String
    },
    ft: {
        type: String
    },
    ap: {
        type: String
    },
    v: {
        type: String
    },
    bp1: {
        type: String
    },
    sp1: {
        type: String
    },
    bq1: {
        type: String
    },
    sq1: {
        type: String
    },
})

module.exports = mongoose.model('SubscriptiontoMarketData', realtimeData)

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