const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')
const User = require('./user')
//we wrote the above line so whenever we want to call mongoose.Schema we can perform the same work by calling only Schema
//https://res.cloudinary.com/demo/image/upload/c_thumb,g_face,h_200,w_200/r_max/f_auto/woman-blackdress-stairs.png
const imageSchema = new Schema({
    url: String,
    filename: String
});

/**
 A virtual is created using the virtual() method on a Mongoose schema.
It allows you to define additional properties that are not stored in the actual document in the database.
They just act on the specified things but do change the actual database
 */
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };


const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [imageSchema],
    author: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]



},opts)
CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,20)}...`
})
//we use below function so that when we delete a ccampground we also delete all the reviews
//if ew dont use below function, the thing even if we delete our campground all the reviews will be left behind like orphaned
//So we use this middleware function
//it is trggered findbyIdAndDelete
//when we trigger the below middleware , deleteMany function is called
//then id is passed in the function and it is matched with id array which are nothing but reviews
//thus everything is deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground', CampgroundSchema);