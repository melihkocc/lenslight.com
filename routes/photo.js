const express = require("express")
const router = express.Router();

const photoController =  require("../controllers/photo")

router.get("/add-photo",photoController.getAddPhoto)
router.post("/add-photo",photoController.postAddPhoto) 

router.get("/photo/:photoid",photoController.getPhoto)

router.get("/profilePhoto",photoController.getProfilePhoto)
router.post("/profilePhoto",photoController.postProfilePhoto) 

router.get("/edit-photo/:photoid",photoController.getEditPhoto)
router.post("/edit-photo",photoController.postEditPhoto) 

router.get("/delete-photo/:photoid",photoController.deletePhoto)

module.exports = router;