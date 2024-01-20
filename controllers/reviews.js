const Campground = require('../models/compground')

const Review = require('../models/review');


module.exports.reviewPost = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id;
    campground.reviews.push(review)
    console.log(review.author)
    await review.save()
    await campground.save()
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewid } = req.params
    //Since reviews are stored as reference in the campground model
    //I used the below method fro removing the refernece of that review from the Campground
    //I used $pull for this stuff
    //Then i delete the review from the Review model
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    await Review.findByIdAndDelete(reviewid);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}