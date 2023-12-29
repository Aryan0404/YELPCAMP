const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')
//we wrote the above line so whenever we want to call mongoose.Schema we can perform the same work by calling only Schema

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]



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