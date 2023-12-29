const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

/*When you use passportLocalMongoose, it automatically adds a username field to the schema and provides methods for working with passwords and user authentication. */
userSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', userSchema)