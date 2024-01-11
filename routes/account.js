const express = require("express")
const router = express.Router();

const accountController = require("../controllers/account")
const loginRegisterEngelleme = require("../middlewares/loginRegisterEngelleme")
const authenticationToUrl = require("../middlewares/authenticationToUrl")

const singlePhotoEngelleme = require("../middlewares/singlePhotoEngelleme")

router.get("/register",loginRegisterEngelleme,accountController.getRegister)
router.post("/register",loginRegisterEngelleme,accountController.postRegister)

router.get("/login",loginRegisterEngelleme,accountController.getLogin)
router.post("/login",loginRegisterEngelleme,accountController.postLogin)

router.get("/logout",accountController.getLogout)
router.get("/dashboard",authenticationToUrl,accountController.getDashboard)

router.get("/user/:userid",accountController.getUser)
router.get("/user/singlePhoto/:photoid",singlePhotoEngelleme,accountController.getSinglePhoto)


router.get("/user/like/:photoid",authenticationToUrl,accountController.getLikePhoto)
router.get("/user/removeLikes/:photoid",authenticationToUrl,accountController.getRemoveLikesPhoto)
router.get("/my-likes-photos",authenticationToUrl,accountController.getMyLikesPhoto)

router.get("/follow/:userid",authenticationToUrl,accountController.follow)
router.get("/unfollow/:userid",authenticationToUrl,accountController.unfollow)

router.get("/my-followers",authenticationToUrl,accountController.getMyFollowers)
router.get("/my-followings",authenticationToUrl,accountController.getMyFollowings)


module.exports = router;