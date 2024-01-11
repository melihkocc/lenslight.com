const Photo = require("../models/photo")
module.exports = (req,res,next) => {
    Photo.findOne({user:req.user._id})
        .then(photo=>{
            if(photo._id == req.params.photoid){
                next();
            }
            else{
                return res.redirect("/")
            }
        })
}