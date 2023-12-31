const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
router.get('/register', (req, res) => {
    res.render('users/register')
})
router.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password);
        console.log(registeredUser)
        //the below callback function is required when we register
        //if we dont use this then we have to log in again even when we register
        //so req.login checks wether the registeredUser exists and then logs us in
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to yelp camp!')
            res.redirect('/campgrounds')
        })

    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}))
router.get('/login', (req, res) => {
    res.render('users/login')
})
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back');
    res.redirect('/campgrounds')
})
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});
module.exports = router
