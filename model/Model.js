const mongoose = require('mongoose');
const userSchema = require('./schema/UserSchema')





module.exports = {
    UserModel:mongoose.model('UserModel', userSchema)
}
