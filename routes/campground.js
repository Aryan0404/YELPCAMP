const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Campground = require('../models/compground')
const { campgroundSchema } = require('../schemas')
const methodOverride = require('method-override')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const { isLoggedIn } = require('../middleware')
const router = express.Router();

const validateCampground = (req, res, next) => {
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
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});
router.get('/new', isLoggedIn, (req, res) => {

    res.render('new')
})

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('index', { campgrounds })
}))
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews')
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    console.log(campground)
    res.render('show', { campground })
}))

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {

    const campgroundd = new Campground(req.body);
    await campgroundd.save();

    console.log(req.body);
    req.flash('success', 'Succesfully made a new campground')
    res.redirect(`campgrounds/${campgroundd._id}`);
}));


router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    console.log(campground)
    res.render('edit', { campground })
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}))
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, req.body)
    req.flash('success', 'Successfully updated')
    res.redirect(`/campgrounds/${campground._id}`)
}))


module.exports = router