const morgan = require('morgan');
const cors = require('cors');
const createError = require('http-errors');
const express = require('express');
const auth_Router = require('./router/authVender');
const order_Router = require('./router/order_router');
const funds = require('./router/funds');
const contract_master = require('./router/conteact_master');
const profile = require('./router/profile');
const history = require('./router/history');
const socket = require('./router/socket');
const app = express();


app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(morgan('dev'));
app.use(cors());


app.get('/', (req,res) =>{
    res.status(200).json({
        message: "Working"
    })
})

app.use('/api/v1/', auth_Router);
app.use('/api/v1/order', order_Router);
app.use('/api/v1/funds', funds);
app.use('/api/v1/contract', contract_master);
app.use('/api/v1/profile',profile );
app.use('/api/v1/history', history);
app.use('/api/v1/socket', socket)


app.all('*', (req, res, next) => {
    return next(
        createError(404, 'Path does not exists'));
})



app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    if (err.status) {
        console.log(err);
        console.log('error middleware');
        return res.status(err.status).json({
            msg: err.message
        })

    } else {

        console.log(err);
        console.log('error middleware status not given');
        return res.status(500).json({
            msg: err.message
        })
    }

})



module.exports = app;