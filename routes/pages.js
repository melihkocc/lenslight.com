const express = require("express")
const router = express.Router();

const pagesController = require("../controllers/pages")

router.get("/",pagesController.index);

router.get("/gallery",pagesController.getGallery)

router.get("/about",pagesController.getAbout)

router.get("/contact",pagesController.getContact)
router.post("/contact",pagesController.postContact)

module.exports = router;
