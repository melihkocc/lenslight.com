

const express = require("express")
const mongoose = require("mongoose")
const app = express();
const path = require("path")
const bodyParser = require("body-parser")
const User = require("./models/user")
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2

/// DOTENV CONFİG START
const dotenv = require("dotenv")
dotenv.config();
/// DOTENV CONFİG END

/// cloduinary config START

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET
})

/// cloduinary config END



/// user session START
const session = require("express-session")
const mongodbStore = require("connect-mongodb-session")(session);
/// user session END


/// ejs kurulum START
app.set("view engine","pug");
app.set("views","./views")
/// ejs kurulum END

/// routes START
const pageRoute = require("./routes/pages")
const accountRoute = require("./routes/account")
const photoRoute = require("./routes/photo")
/// routes END




/// public dosyaları dahil et
app.use(express.static(path.join(__dirname  ,"public")));
app.use(bodyParser.urlencoded({extended:false}));
app.use(fileUpload({useTempFiles:true}))
/// session START


var store = new mongodbStore({
    uri : "mongodb+srv://kocmelih684:Fight4Freedom@cluster0.xfs3tlc.mongodb.net/",
    collection : "mySessions"
})

app.use(session({
    secret : "keyboard cat",
    resave : false,
    saveUninitialized : false,
    store : store
}))

/// session END


app.use(async (req, res, next) => {
    if (!req.session.user) {
        return next();
    }

    try {
        const user = await User.findById(req.session.user._id);

        if (user) {
            req.user = user;
        }

        next();
    } catch (err) {
        console.log(err);
        next(err);
    }
});





const sendAuthenticate = require("./middlewares/authentication")
const authenticationToUrl = require("./middlewares/authenticationToUrl")
app.use("/",sendAuthenticate,pageRoute)
app.use("/",sendAuthenticate,accountRoute)
app.use("/",authenticationToUrl,sendAuthenticate,photoRoute)
const errorController = require("./controllers/404")
app.use("/",errorController.get404)

const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD;
const port = process.env.PORT || 3000;
mongoose.connect(`mongodb+srv://${databaseUser}:${databasePassword}@cluster0.xfs3tlc.mongodb.net/`)
    .then(()=>{
        console.log("Connected")
        app.listen(port)
    })
    .catch(err=>console.log(err))