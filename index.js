const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const http = require('http');
const server = http.createServer(app);
const bodyparser = require("body-parser");
const serverless = require("serverless-http");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 2005;

mongoose
  .connect("mongodb+srv://ankit:ankit@cluster0.vkljao5.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    console.log("Db conneted succesfully");
  })
  .catch((err) => {
    console.log(err);
  });
app.get("/", (req, res) => {
  res.send("Hello World!");
});
const auth_Router = require('./router/authVender');
const order_Router = require('./router/order_router');
const funds = require('./router/funds');
const contract_master = require('./router/conteact_master');
const profile = require('./router/profile');
const history = require('./router/history');
const socket = require('./router/socket');
const admin = require('./router/admin.route');
const marketdepth = require('./router/marketdepth');

app.use('/api/v1/', auth_Router);
app.use('/api/v1/order', order_Router);
app.use('/api/v1/funds', funds);
app.use('/api/v1/contract', contract_master);
app.use('/api/v1/profile', profile);
app.use('/api/v1/history', history);
app.use('/api/v1/socket', socket)
app.use('/api/v1/admin', admin)
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
module.exports = {
  handler: serverless(app),
};