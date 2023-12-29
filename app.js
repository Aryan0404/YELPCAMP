const express = require('express');
const app = express();
const flash = require('connect-flash');
const mongoose = require('mongoose');
const Campground = require('./models/compground')
const { campgroundSchema, reviewSchema } = require('./schemas')
const methodOverride = require('method-override')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Review = require('./models/review');
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users');
const session = require('express-session')
const { isLoggedIn } = require('./middleware')
//----------------------------------------------------------------------------------------------------------------------------------------------
//passport logic
const passport = require('passport')
const LocalSrategy = require('passport-local')
const User = require('./models/user')
//-------------------------------------------------------------------------------------------------------------------------------------------

/*ejs-mate is an extension or companion library for the EJS (Embedded JavaScript) templating
 engine in Node.js. It provides additional features and functionality
  to enhance the capabilities of EJS templates. Specifically, ejs-mate adds support for 
  layouts and partials, making it easier to create modular and reusable templates.
*/
const ejsMate = require('ejs-mate')
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => console.log('Connected!'));
const path = require('path');
/*app.engine('ejs', ejsMate): This line is configuring Express to use the ejsMate engine 
for files with the .ejs extension. It's specifying that
 when Express encounters a file with the .ejs extension, it should use the ejsMate engine to render it. */
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
//this is for req.body
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))


const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        //I used http only for extra protection
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))

//used for showing flsh messages
app.use(flash());
//-------------------------------------------------------------------------------------------------------------------------------------------
app.use(passport.initialize())
//app.use session should be above passport.session
app.use(passport.session())
passport.use(new LocalSrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
//the above line serializes the user
//serializng is basically how to store user into a session so that we can make sure he has logged in and he does not need to log in again and again
passport.deserializeUser(User.deserializeUser());
//the above line tells us how to get user out of the session once he has logged out or deleted his account
//---------------------------------------------------------------------------------------------------------------------------------------------

app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.currentUser = req.user;
    next()
})
//flash sessions should always be above the normal routes and below sessions because it needs session
/*Flash messages are tied to sessions: Since flash messages are often stored in the session, it makes sense to handle them 
afer sessions are initialized. This ensures that flash messages can be set in one request and displayed in the next.*/

/*
Feedback for user actions: Flash messages are often used to provide feedback to users after a specific action. 
By handling flash messages before normalroutes, you can ensure that any feedback is available for rendering 
when the views are generated. */
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/fakeUser', async (req, res) => {
    //the below line makes the username and takes the gmail
    const user = new User({ email: 'coltt@gmail.com', username: 'coltt' })
    //the below line makes the newUser and adds the password, where chicken is the password
    //passport automatically adds the salt and hash
    //register is an inbuilt passport method
    const newUser = await User.register(user, 'chicken')
    res.send(newUser)
})


//I use express.static middleware to serve teh static files from the public directory and dirname joins the current directory  with the public directory
app.use(express.static(path.join(__dirname, 'public')))
//JOI checks for each and every thing we used joi in shemas.js and then we exported those schemas above 
//the below function validates using Joi





//The below is the express error hadnling mechanism 
//All the errors, normal ones and async ones all will be thrown to the below error handling mechanism of app.use

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went Wrong"
    res.status(statusCode).render('error', { err })
    //res.send("Oh buoi something went wrong")
})

app.listen(3000, () => {
    console.log('connection established on port 3000')
})
