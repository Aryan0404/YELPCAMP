const { campgroundSchema, reviewSchema } = require('./schemas')
const Campground = require('./models/compground')
const ExpressError = require('./utils/ExpressError')
const Review = require('./models/review')

/*
req.isAuthenticated() is a function provided by the authentication middleware in a Node.js web application, 
typically with frameworks like Passport.js.

The function returns true if the user is authenticated (i.e., they have successfully logged in), and false otherwise. */
module.exports.isLoggedIn = (req, res, next) => {
    /*
    req.isAuthenticated() is a method provided by Passport.js, which is a popular authentication middleware for Node.js. 
    This method is used to check whether a user is authenticated or not. It is typically used in route handlers to ensure 
    that only authenticated users can access certain routes or resources. */
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login')
    }
    next()
}
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo
    }
    next()
}

module.exports.validateCampground = (req, res, next) => {
    const result = campgroundSchema.validate(req.body);
    const { error } = result
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    }
    else {
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}
/*Here the campground owner is checking with the author id who is the owner of the campground as well with the current logged in user */
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    } else {
        next()
    }
}
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewid } = req.params
    console.log(reviewid)
    const review = await Review.findById(reviewid)
    console.log(review)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}
/*Now if the user is not authencticated then first we store the original Url the url which the user requests in the session
But since due to security updates in passport as soon as we login the the session is cleared thats why the store the original Url inside a local object 
like res.locals.returnTo we define it as a middleware after that we enter the middleware in the post login route 
*/