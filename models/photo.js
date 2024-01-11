const mongoose = require("mongoose")

const photoSchema = mongoose.Schema({
    name: {
        type : String,
        required : true,
        trim : true
    },
    description: {
        type: String,
        required : true,
        trim : true,
    },
    uploadedDate : {
        type : Date,
        default : Date.now,
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
    },
    url : {
        type : String,
        required : true
    },
    image_id : {
        type : String,
        required : true,
    }
})

module.exports = mongoose.model("Photo",photoSchema)