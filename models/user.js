const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const dataSchema = new Schema ({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: Number,
        required: true
    },
    password: {
        type:String,
    },
    createdAt: {
        type: Date,
        default: Date.now 
    }
});

module.exports = Data = mongoose.model("user", dataSchema);
