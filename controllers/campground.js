const { cloudinary } = require('../cloudinary')
const Campground = require('../models/compground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
module.exports.newCamp = (req, res) => {

    res.render('new')
}

module.exports.indexCamp = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('index', { campgrounds })
}

module.exports.showCamp = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    console.log(campground)
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    console.log(campground)
    res.render('show', { campground })
}

module.exports.postCamp = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        //limit is used so that I get only 1 result
        limit: 1
    }).send()
    const campgroundd = new Campground(req.body);
    campgroundd.geometry = geoData.body.features[0].geometry;
    /*You are setting the images property of the campgroundd object. It looks like you are expecting an array of files in the 
    req.files property. You are using the map function to transform each file object in req.files into a new object containing 
    the url and filename properties.

 */
    campgroundd.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campgroundd.author = req.user._id
    console.log('Rafjdp')
    console.log(campgroundd)

    await campgroundd.save();

    req.flash('success', 'Succesfully made a new campground')
    res.redirect(`campgrounds/${campgroundd._id}`);
}

module.exports.editCamp = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    console.log(campground)
    res.render('edit', { campground })
}
module.exports.deleteCamp = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds')
}


module.exports.updateCamp = async (req, res) => {
    const { id } = req.params
    console.log(req.body)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        //limit is used so that I get only 1 result
        limit: 1
    }).send()
    const campground = await Campground.findByIdAndUpdate(id, req.body)
    campground.geometry = geoData.body.features[0].geometry;

    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    console.log('meow')

    campground.images.push(...imgs);
    console.log(campground)


    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        //the pull operator here searches the filename in the req.body.deleteImages ,matches it with the filename in images and then deletes it
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })

    }
    req.flash('success', 'Successfully updated')
    res.redirect(`/campgrounds/${campground._id}`)
}