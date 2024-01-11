const mongoose = require("mongoose")
const {isEmail} = require("validator")

const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        validate : [isEmail,"Geçersiz Email"]
    },
    password : {
        type : String,
        required : true
    },
    resetToken : String,
    resetTokenExpiration : String,
    isAdmin : {
        type : Boolean,
        default : false,
    },
    date : {
        type : Date,
        default : Date.now,
    },
    profilePhotoUrl : {
        type : String,
        default : "/images/custo.jpg"
    },
    likes : [{
        type : mongoose.Schema.ObjectId,
        ref : "Photo",
        required : false
    }],
    takipEdilen : [{
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : false
    }],
    takipci : [{
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : false
    }]
}) 

module.exports = mongoose.model("User",userSchema)