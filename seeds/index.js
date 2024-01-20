const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/compground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => console.log('Connected!'));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '658fb879f3dafd898b888110',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price: price,
            geometry:{type:'Point',
            coordinates:[cities[random1000].longitude, cities[random1000].latitude]

            },
            images: [
                {
                    url: 'https://res.cloudinary.com/df1bbedin/image/upload/v1704386282/YelpCamp/ubxmiv8a3bfqsuwndnzc.png',
                    filename: 'YelpCamp/ubxmiv8a3bfqsuwndnzc',
                },
                {
                    url: 'https://res.cloudinary.com/df1bbedin/image/upload/v1704386278/YelpCamp/kskrrzomk0u63gqvg7un.png',
                    filename: 'YelpCamp/kskrrzomk0u63gqvg7un',
                }
            ]

        })
        await camp.save();

    }
}

seedDB().then(() => {
    mongoose.connection.close();
})


