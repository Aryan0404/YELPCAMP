const User = require('../models/user')



module.exports.register = (req, res) => {
    res.render('users/register')
}

module.exports.registerPost = async (req, res) => {
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
}

module.exports.login = (req, res) => {
    res.render('users/login')
}

module.exports.loginPost = (req, res) => {
    req.flash('success', 'welcome back');
    console.log(res.locals.returnTo)
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}