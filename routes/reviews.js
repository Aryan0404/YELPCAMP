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

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    } else {
        next()
    }
}




router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/:reviewid', catchAsync(async (req, res) => {
    const { id, reviewid } = req.params
    //Since reviews are stored as reference in the campground model
    //I used the below method fro removing the refernece of that review from the Campground
    //I used $pull for this stuff
    //Then i delete the review from the Review model
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    await Review.findByIdAndDelete(reviewid);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router