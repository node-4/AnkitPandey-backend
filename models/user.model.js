const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
    {
        name: {
            type: String,
        },
        phone: {
            type: String,
        },
        email: {
            type: String,
            minLength: 10,
        },
        password: {
            type: String,
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("admin", userSchema);
