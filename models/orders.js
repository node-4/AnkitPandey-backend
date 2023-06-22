const mongoose = require('mongoose');
const OrderManagement = mongoose.Schema({
    orderId: {
        type: String
    },
    userId: {
        type: String
    },
    cash : {
        type: Number, 
        default: 0
    },
    Prc: {
        type: String
    },
    RequestID: {
        type: String
    },
    Cancelqty: {
        type: Number
    },
    discQtyPerc: {
        type: String
    },
    customText: {
        type: String
    },
    Mktpro: {
        type: String
    },
    defmktproval: {
        type: String
    },
    optionType: {
        type: String
    },
    usecs: {
        type: String
    },
    mpro: {
        type: String
    },
    Qty: {
        type: Number
    },
    ordergenerationtype: {
        type: String
    },
    Unfilledsize: {
        type: Number
    },
    orderAuthStatus: {
        type: String
    },
    Usercomments: {
        type: String
    },
    ticksize: {
        type: String
    },
    Prctype: {
        type: String
    },
    Status: {
        type: String
    },
    Minqty: {
        type: Number
    },
    orderCriteria: {
        type: String
    },
    Sym: {
        type: String
    },
    multiplier: {
        type: String
    },
    Exseg: {
        type: String
    },
    ExchOrdID: {
        type: String
    },
    ExchConfrmtime: {
        type: String
    },
    SyomOrderId: {
        type: String
    },
    Pcode: {
        type: String
    },
    Dscqty: {
        type: Number
    },
    Exchange:  {
        type: String
    },
    Ordvaldate: {
        type: String
    },
    accountId: {
        type: String
    },
    exchangeuserinfo: {
        type: String
    },
    Avgprc: {
        type: String
    },
    Trgprc: {
        type: String
    },
    Trantype: {
        type: String
    },
    bqty: {
        type: String
    },
    Fillshares: {
        type: Number
    },
    Trsym: {
        type: String
    },
    AlgoCategory: {
        type: String
    },
    strikePrice: {
        type: String
    },
    sipindicator: {
        type: String
    },
    AlgoID: {
        type: String
    },
    reporttype: {
        type: String
    },
    noMktPro: {
        type: String
    },
    BrokerClient: {
        type: String
    },
    OrderUserMessage: {
        type: String
    },
    decprec: {
        type: String
    },
    ExpDate: {
        type: String
    },
    COPercentage: {
        type: Number
    },
    marketprotectionpercentage: {
        type: String
    },
    ExpSsbDate: {
        type: String
    },
    Nstordno: {
        type: String
    },
    OrderedTime: {
        type: String
    },
    modifiedBy: {
        type: String
    },
    RejReason: {
        type: String
    },
    Scripname: {
        type: String
    },
    stat: {
        type: String
    },
    orderentrytime: {
        type: String
    },
    PriceDenomenator: {
        type: String
    },
    panNo: {
        type: String
    },
    RefLmtPrice: {
        type: String
    },
    PriceNumerator: {
        type: String
    },
    ordersource: {
        type: String
    },
    token: {
        type: String
    },
    GeneralDenomenator: {
        type: String
    },
    Validity: {
        type: String
    },
    series: {
        type: String
    },
    InstName: {
        type: String
    },
    GeneralNumerator: {
        type: String
    },
    user: {
        type: String
    },
    remarks: {
        type: String
    },
    iSinceBOE: {
        type: Number
    },
    complexty: {
        type: String,
        require: true
    },
    discqty: {
        type: String,
        require: true
    },
    exch: {
        type: String,
        require: true
    },
    trading_symbol: {
        type: String
    },
    symbol_id: {
        type: String
    },
    pCode: {
        type: String,
        require: true
    },
    prctyp: {
        type: String,
    },
    price: {
        type: String,
    },
    qty: {
        type: String,
    },
    ret: {
        type: String
    },
    transtype: {
        type: String
    },
    trigPrice: {
        type: String
    }
})

module.exports = mongoose.model('orders', OrderManagement)