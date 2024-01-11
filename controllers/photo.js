const Photo = require("../models/photo")
const cloudinary = require("cloudinary").v2
const fs = require("fs")
const User = require("../models/user")

exports.getAddPhoto = (req,res,next) => {
    res.render("photoIslemler/add-photo")
}

exports.postAddPhoto = async (req,res,next) => {
    const name = req.body.name;
    const description = req.body.description;
    const user = req.user;

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath,{
        use_filename : true,
        folder : "lenslight_tr",
    })


    const photo = new Photo({
        name : name,
        description : description,
        user:user,
        url : result.secure_url,
        image_id : result.public_id,
    })
    photo.save()
        .then(()=>{
            fs.unlink(req.files.image.tempFilePath,(err)=>{
                if(err){
                    console.log(err)
                }
                else{
                    res.redirect("/dashboard")
                }
            })
        })
        .catch(err=>console.log(err))
}

exports.getPhoto = (req,res,next) => {
    const id = req.params.photoid;
    Photo.findById(id).populate("user")
        .then(photo=>{
            const userLikedPhotos = req.user ? req.user.likes.map(like => like.toString()) : [];
            const isLikedByUser = userLikedPhotos.includes(id);
            res.render("photoIslemler/singlePhoto",{
                photo:photo,
                user:photo.user,
                loginUser : req.user,
                isLikedByUser:isLikedByUser
            })
        })
        .catch(err=>console.log(err))
}

exports.getProfilePhoto = (req,res,next) => {
    res.render("photoIslemler/add-profilePhoto")
}

exports.postProfilePhoto = async (req,res,next) => {
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath,{
        use_filename : true,
        folder : "lenslight_tr_profilePhoto",
    })

        User.findById(req.user._id)
            .then(user=>{
                user.name = req.user.name
                user.lastName = req.user.lastName
                user.email = req.user.email
                user.password = req.user.password
                user.profilePhotoUrl = result.secure_url
                return user.save()
            })
            .then(()=>{
                fs.unlink(req.files.image.tempFilePath,(err)=>{
                    if(err){
                        console.log(err)
                    }
                    else{
                        res.redirect("/dashboard")
                    }
                })
            })
            .catch(err=>console.log(err))
}

exports.getEditPhoto = (req,res,next) => {
    const id = req.params.photoid
    Photo.findById(id)
        .then(photo=>{
            res.render("photoIslemler/edit-photo",{
                photo:photo
            })
        })
        .catch(err=>console.log(err))
}

exports.postEditPhoto = (req,res,next) => {
    Photo.findById(req.body.id)
        .then( async (photo)=>{
            if(req.files){
                await cloudinary.uploader.destroy(photo.image_id)

                const result = await cloudinary.uploader.upload(req.files.image.tempFilePath,{
                    use_filename : true,
                    folder : "lenslight_tr",
                })

                photo.url = result.secure_url;
                photo.image_id = result.public_id;

                fs.unlink(req.files.image.tempFilePath,(err)=>{
                    if(err){
                        console.log(err)
                    }
                    else{
                        res.redirect("/dashboard")
                    }
                })
            }

            photo.name = req.body.name;
            photo.description = req.body.description;
            return photo.save();
        })
        .then(()=>res.redirect("/dashboard"))
        .catch(err=>console.log(err))
}

exports.deletePhoto = (req,res,next) => {

    const id = req.params.photoid

    Photo.findById(id)
        .then( async (photo) => {
            await cloudinary.uploader.destroy(photo.image_id)
            await Photo.deleteOne({ _id:id })
            res.redirect("/dashboard")
        })
        .catch(err=>console.log(err))

}