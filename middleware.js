/*
req.isAuthenticated() is a function provided by the authentication middleware in a Node.js web application, 
typically with frameworks like Passport.js.

The function returns true if the user is authenticated (i.e., they have successfully logged in), and false otherwise. */
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login')
    }
    next()
}