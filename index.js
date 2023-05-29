const serverless = require('serverless-http')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
require('dotenv').config();



mongoose.connection.on('connected', () => console.log('connected'));
mongoose.connection.on('disconnected', () => console.log('disconnected'));
mongoose.connection.on('error', (error) => console.log(error));

app.listen(process.env.PORT || 3001, async () => {
    await mongoose.connect(process.env.DATABASE || "mongodb+srv://ankit:ankit@cluster0.vkljao5.mongodb.net/?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log(`listening on port ${process.env.PORT || 3001}`);})



module.exports = {
    handler: serverless(app)
}