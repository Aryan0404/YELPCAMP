const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Campground = require('../models/compground')
const { campgroundSchema } = require('../schemas')
const methodOverride = require('method-override')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const { isLoggedIn } = require('../middleware')
const { validateCampground } = require('../middleware')
const { isAuthor } = require('../middleware')
const router = express.Router();
const camp = require('../controllers/campground')

//Multer is the middleware which parses files upload into req.body and so that we can use it , we specifically used it for image upload
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })





router.get('/new', isLoggedIn, camp.newCamp)
router.route('/')
    .get(catchAsync(camp.indexCamp))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(camp.postCamp));

//the upload.single here catched the file we uploaded
/* .post(upload.array('image'), (req, res) => {
    console.log(req.body, req.files)
    res.send("It worked")
})
*/

router.route('/:id')
    .get(catchAsync(camp.showCamp))
    .delete(isLoggedIn, isAuthor, catchAsync(camp.deleteCamp))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(camp.updateCamp))


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(camp.editCamp))



module.exports = router