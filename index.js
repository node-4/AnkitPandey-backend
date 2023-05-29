const serverless = require('serverless-http')
const mongoose = require('mongoose');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const createError = require('http-errors');
const express = require('express');
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
const auth_Router = require('./router/authVender');
const order_Router = require('./router/order_router');
const funds = require('./router/funds');
const contract_master = require('./router/conteact_master');
const profile = require('./router/profile');
const history = require('./router/history');
const socket = require('./router/socket');
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





mongoose.connection.on('connected', () => console.log('connected'));
mongoose.connection.on('disconnected', () => console.log('disconnected'));
mongoose.connection.on('error', (error) => console.log(error));

app.listen(process.env.PORT || 3001, async () => {
    await mongoose.connect("mongodb+srv://ankit:ankit@cluster0.vkljao5.mongodb.net/?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log(`listening on port ${process.env.PORT || 3001}`);})



module.exports = {
    handler: serverless(app)
}