const User = require("../models/user")
const bcrypt = require("bcrypt")
const sgMail = require("@sendgrid/mail")
const Photo = require("../models/photo")

sgMail.setApiKey(process.env.SGMAIL_API_KEY)


exports.getRegister = (req,res,next) => {
    var errorMessage = req.session.errorMessage;
    delete req.session.errorMessage
    res.render("account/register",{
        errorMessage : errorMessage,
        path : "register"
    })
}


exports.postRegister = async (req, res, next) => {
    try {
        const name = req.body.name;
        const lastName = req.body.lastName;
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ email: email });

        if (user) {
            req.session.errorMessage = "Bu mail hesabı ile daha önceden kayıt olunmuş !";
            await req.session.save();
            return res.redirect("/register");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (!hashedPassword) {
            throw new Error("Password hashing failed");
        }

        const newUser = new User({
            name: name,
            lastName: lastName,
            email: email,
            password: hashedPassword,
        });

        await newUser.save();
        return res.redirect("/login");
    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.getLogin = (req,res,next) => {
    var errorMessage = req.session.errorMessage
    delete req.session.errorMessage
    res.render("account/login",{
        errorMessage:errorMessage
    })
}

exports.postLogin = async (req,res,next) =>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({email:email})

        if(!user){
            req.session.errorMessage = "Bu mail adresi ile kayıtlı bir kullanıcı bulunamadı !";
            await req.session.save()
            return res.redirect("/login");        
        }

        const isSuccess = await bcrypt.compare(password,user.password)
        
        if(isSuccess){
            req.session.user = user;
            req.session.isAuthenticated = true;
            await req.session.save();
            var url = req.session.redirectTo || "/";
            res.redirect(url)
        }
        else{
            req.session.errorMessage = "Hatalı Parola !";
            await req.session.save();
            return res.redirect("/login")
        }
    } catch (error) {
        console.log(error)
    }

}

exports.getLogout = (req,res,next) => {
    req.session.destroy((err)=>{
        console.log(err)
        res.redirect("/")
    })
}

exports.getDashboard = (req,res,next) => {

    Photo.find({user:req.user})
        .then( (photos)=>{

            User.aggregate([
                { $match: { _id: req.user._id }},
                { 
                    $project: { 
                      takipciCount: { $cond: { if: { $isArray: "$takipci" }, then: { $size: "$takipci" }, else: 0 } }, // Takipçi dizisinin boyutunu al
                      takipEdilenCount: { $cond: { if: { $isArray: "$takipEdilen" }, then: { $size: "$takipEdilen" }, else: 0 } } // Takip edilen dizisinin boyutunu al
                    } 
                  }
            ]).exec()
                .then(result=>{
                    res.render("account/dashboard",{
                        user:req.user,
                        photos:photos,
                        takipciSayisi : result[0].takipciCount,
                        takipEdilenSayisi : result[0].takipEdilenCount,
                        path : "dashboard"
                    })
                })
                .catch(err=>console.log(err))

        })
        .catch(err=>console.log(err))
}

exports.getUser = (req,res,next) => {

    const id = req.params.userid
    User.findById(id)
        .then(user=>{
            Photo.find({user:id})
                .then(photos=>{

                    const inFollowers = user.takipci.some((takipci) => {
                        return takipci.equals(req.user._id)
                    })

                    res.render("account/singleUser.pug",{
                        user:user,
                        photos:photos,
                        inFollowers : inFollowers
                    })

                })
                .catch(err=>console.log(err))
        })
        .catch(err=>console.log(err))

}

exports.getSinglePhoto = (req,res,next) => {
    const id = req.params.photoid
    Photo.findById(id)
        .then(photo=>{
            res.render("account/singlePhoto",{
                photo:photo,
            })
        })
        .catch(err=>console.log(err))
}

exports.getLikePhoto = (req,res,next) => {
    User.findOne({_id:req.user._id})
        .then( async (user)=>{
            const photo = await Photo.findOne({_id:req.params.photoid})
            user.name = req.user.name;
            user.lastName = req.user.lastName;
            user.email = req.user.email;
            user.password = req.user.password;
            user.profilePhotoUrl = req.user.profilePhotoUrl;
            user.likes.push(photo)
            return user.save()
        })
        .then(()=>{
            res.redirect("/my-likes-photos")
        })
        .catch(err=>console.log(err))
}

exports.getMyLikesPhoto = (req,res,next) => {

    User.findOne({_id:req.user._id}).populate("likes")
        .then(user=>{
            res.render("account/myLikesPhoto",{
                user : user,
                photos : user.likes
            })
        })
        .catch(err=>{console.log(err)})
}

exports.getRemoveLikesPhoto = (req,res,next) => {
    User.findOne({_id:req.user._id})
        .then( async (user)=>{
            const photo = await Photo.findOne({_id:req.params.photoid})
            user.name = req.user.name;
            user.lastName = req.user.lastName;
            user.email = req.user.email;
            user.password = req.user.password;
            user.profilePhotoUrl = req.user.profilePhotoUrl;
            user.likes.pull(photo)
            return user.save()
        })
        .then(()=>{
            res.redirect("/my-likes-photos")
        })
        .catch(err=>console.log(err))
}

exports.follow = async (req,res,next) => {
    const userid = req.params.userid

    const followUser = await User.findOneAndUpdate(
        {_id : userid},
        {
            $push : {takipci : req.user._id}
        },
        {new:true}
    )

    const user = await User.findOneAndUpdate(
        {_id : req.user._id},
        {
            $push : {takipEdilen : followUser._id}
        },
        {new:true}
    )
    
    return res.redirect("/dashboard")
}

exports.unfollow = async (req,res,next) => {
    const userid = req.params.userid

    const unfollowedUser = await User.findOneAndUpdate(
        {_id : userid},
        {
            $pull : {takipci : req.user._id}
        },
        {new:true}
    )

    const user = await User.findOneAndUpdate(
        {_id : req.user._id},
        {
            $pull : {takipEdilen : unfollowedUser._id}
        },
        {new:true}
    )
    
    return res.redirect("/dashboard")
}

exports.getMyFollowers = (req,res,next) => {
    User.findOne({_id : req.user._id}).populate("takipci")
        .then(user=>{
            res.render("account/takipciler",{
                users: user.takipci
            })
        })
}

exports.getMyFollowings = (req,res,next) => {
    User.findOne({_id : req.user._id}).populate("takipEdilen")
    .then(user=>{
        res.render("account/takipEdilenler",{
            users: user.takipEdilen
        })
    })
}