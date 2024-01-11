const Photo = require("../models/photo")
const User = require("../models/user")
const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SGMAIL_API_KEY)


exports.index = (req,res,next) => {
    Photo.find().sort({uploadedDate:-1}).limit(3)
        .then(async (latestPhotos)=>{
            const photoNumber = await Photo.countDocuments();
            const userNumber = await User.countDocuments();
            res.render("pages/index",{
                pageTitle : "LendsLight",
                user : req.user,
                latestPhotos:latestPhotos,
                photoNumber:photoNumber,
                userNumber:userNumber,
                path : "index"
            })
        })
        .catch(err=>console.log(err))
}

exports.getGallery = (req,res,next) => {
    const loggedInUserId = req.user ? req.user._id : null;
    Photo.find({ user: { $ne: loggedInUserId } })
        .then(photos=>{
            res.render("pages/gallery",{
                photos : photos,
                path : "gallery"
            })
        })
        .catch(err=>console.log(err))
}

exports.getAbout = (req,res,next) => {
    res.render("pages/about",{
        path : "about"
    })
}

exports.getContact = (req,res,next) => {
    res.render("pages/contact",{
        path : "contact"
    })
}

exports.postContact = (req,res,next) => {
    const msg = {
        to: 'kocmelih20@gmail.com',
        from: req.body.email,
        subject: 'LensLight İletişim',
        html: req.body.message
      }
      sgMail.send(msg)
        .then(() => {
            res.redirect("/")
        })
        .catch((error) => {
            res.redirect("/")
            console.error(error)
        })
}