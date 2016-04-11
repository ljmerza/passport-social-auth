'use strict'

const mongoose = require('mongoose'),
    bcrypt   = require('bcrypt-nodejs')

// define schema for user model
let userSchema = mongoose.Schema({

    local: {
        email: String,
        password: String,
    },
    facebook: {
        id: String,
        token: String,
        name: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    instagram: {
        id: String,
        token: String,
        username: String,
        name: String
    },
    linkedin: {
        id: String,
        token: String,
        username: String,
        name: String
    },
    github: {
        id: String,
        token: String,
        username: String,
        name: String,
        email: String,
        url: String
    }

})

// generate hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
}

// check if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password)
}

// create the model for users and expose it to app
module.exports = mongoose.model('User', userSchema)
