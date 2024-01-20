const express = require('express');
const app = express();
const router = express.Router({ mergeParams: true })
//the reason for using merge params true is because i want to access the campground id's in the routes
const mongoose = require('mongoose');
const Campground = require('../models/compground')
const { reviewSchema } = require('../schemas')
const methodOverride = require('method-override')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Review = require('../models/review');
const { isReviewAuthor } = require('../middleware')
const { isLoggedIn } = require('../middleware')
const { validateReview } = require('../middleware')
const reviews = require('../controllers/reviews')
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.reviewPost))
router.delete('/:reviewid', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router