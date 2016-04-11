'use strict'

// import orde is same as code order
let LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    InstagramStrategy = require('passport-instagram').Strategy,
    LinkedInStrategy = require('passport-linkedin').Strategy,
    GithubStrategy = require('passport-github').Strategy

// load the user model
let User = require('../app/models/user')

// load authorization keys
let configAuth = require('./auth')

module.exports = function(passport) {

    // serialize user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })
    // deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user)
        })
    })

    /******************************login login***************************/
    passport.use('local-login', new LocalStrategy({
        // override default fields in passport module
        usernameField : 'email',
        passwordField : 'password',
        // pass in request from route to check if a user is logged in
        passReqToCallback : true 
    },
    function(req, email, password, done) {
        // async for login to be done before db access
        process.nextTick(function() {
            // find user by email
            User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err) { return done(err) }

                // if no user is found send flash
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'))
                // if invalid password send flash
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'))
                // else login successful
                else
                    return done(null, user)
            })
        })
    }))

    /************************local sign up***************************************/
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {

        process.nextTick(function() {
            // see if email is used already
            User.findOne({'local.email': email}, function(err, existingUser) {
                // if error stop db connection and return error
                if (err) { return done(err) }

                // if email exists then send flash
                if (existingUser) 
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

                //  if login successful connect to new local account
                if(req.user) {
                    let user = req.user
                    user.local.email = email
                    user.local.password = user.generateHash(password)
                    user.save(function(err) {
                        if (err) { throw err }
                        return done(null, user)
                    })
                } 
                // else create new local account
                else {
                    // create user model
                    let newUser = new User()
                    newUser.local.email = email
                    newUser.local.password = newUser.generateHash(password)
                    newUser.save(function(err) {
                        if (err) { throw err }
                        return done(null, newUser)
                    })
                }

            })
        })
    }))

    /******************************facebook sign up*****************************/
    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        passReqToCallback : true
    },
    function(req, token, refreshToken, profile, done) {
        console.log('facebook:', profile)
        process.nextTick(function() {

            if (! req.user) {
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err) { return done(err) }
                    if (user) {
                        // if there is a user id already but no token 
                        // then user was linked at one point and then removed
                        if (! user.facebook.token) {
                            user.facebook.token = token
                            user.facebook.name  = profile.displayName
                            user.save(function(err) {
                                if (err) { throw err }
                                return done(null, user)
                            })
                        }
                        // user found return user
                        return done(null, user)
                    } else {
                        // if there is no user then create
                        let newUser = new User()

                        newUser.facebook.id = profile.id
                        newUser.facebook.token = token
                        newUser.facebook.name  = profile.displayName
                        //newUser.facebook.email = profile.emails[0].value;
                        newUser.save(function(err) {
                            if (err) { throw err }
                            return done(null, newUser)
                        })
                    }
                })
            } else {
                // user already exists and is logged in so link the accounts
                let user = req.user
                user.facebook.id = profile.id
                user.facebook.token = token
                user.facebook.name = profile.displayName
                //user.facebook.email = profile.emails[0].value

                user.save(function(err) {
                    if (err) { throw err }
                    return done(null, user)
                })
            }
        })
    }))

    /************************twitter sign up******************************************/
    passport.use(new TwitterStrategy({
        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret: configAuth.twitterAuth.consumerSecret,
        callbackURL: configAuth.twitterAuth.callbackURL,
        passReqToCallback : true

    },
    function(req, token, tokenSecret, profile, done) {
        console.log('twitter:', profile)
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                    if (err) { return done(err) }

                    if (user) {
                        if (!user.twitter.token) {
                            user.twitter.token = token
                            user.twitter.username = profile.username
                            user.twitter.displayName = profile.displayName

                            user.save(function(err) {
                                if (err) { throw err }
                                return done(null, user)
                            })
                        }
                        return done(null, user)
                    } else {
                        var newUser = new User()
                        newUser.twitter.id = profile.id
                        newUser.twitter.token = token
                        newUser.twitter.username = profile.username
                        newUser.twitter.displayName = profile.displayName

                        newUser.save(function(err) {
                            if (err) { throw err }
                            return done(null, newUser)
                        })
                    }
                })
            } else {
                let user = req.user
                user.twitter.id = profile.id
                user.twitter.token = token
                user.twitter.username = profile.username
                user.twitter.displayName = profile.displayName

                user.save(function(err) {
                    if (err) { throw err }
                    return done(null, user)
                })
            }

        })

    }))

    /**************************google sign up**************************************/
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback : true
    },
    function(req, token, refreshToken, profile, done) {
        console.log('google:', profile)
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err) { return done(err) }

                    if (user) {
                        if (!user.google.token) {
                            user.google.token = token
                            user.google.name = profile.displayName
                            user.google.email = profile.emails[0].value

                            user.save(function(err) {
                                if (err) { throw err }
                                return done(null, user)
                            })
                        }
                        return done(null, user)
                    } else {
                        var newUser = new User()
                        newUser.google.id = profile.id
                        newUser.google.token = token
                        newUser.google.name = profile.displayName
                        newUser.google.email = profile.emails[0].value

                        newUser.save(function(err) {
                            if (err) { throw err }
                            return done(null, newUser)
                        })
                    }
                })
            } else {
                var user = req.user
                user.google.id = profile.id
                user.google.token = token
                user.google.name = profile.displayName
                user.google.email = profile.emails[0].value
                user.save(function(err) {
                    if (err) { throw err }
                    return done(null, user)
                })
            }

        })

    }))

    /**************************instagram sign up**************************************/
    passport.use(new InstagramStrategy({
        clientID: configAuth.instagramAuth.clientID,
        clientSecret: configAuth.instagramAuth.clientSecret,
        callbackURL: configAuth.instagramAuth.callbackURL,
        passReqToCallback : true
    },
    function(req, token, refreshToken, profile, done) {
        console.log('instagram:', profile)
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'instagram.id' : profile.id }, function(err, user) {
                    if (err) { return done(err) }

                    if (user) {
                        if (!user.instagram.token) {
                            user.instagram.token = token
                            user.instagram.name = profile.displayName
                            user.instagram.username = profile.username

                            user.save(function(err) {
                                if (err) { throw err }
                                return done(null, user)
                            })
                        }
                        return done(null, user)
                    } else {
                        var newUser = new User()
                        newUser.instagram.id = profile.id
                        newUser.instagram.token = token
                        newUser.instagram.name = profile.displayName
                        newUser.instagram.username = profile.username

                        newUser.save(function(err) {
                            if (err) { throw err }
                            return done(null, newUser)
                        })
                    }
                })
            } else {
                var user = req.user
                user.instagram.id = profile.id
                user.instagram.token = token
                user.instagram.name = profile.displayName
                user.instagram.username = profile.username
                user.save(function(err) {
                    if (err) { throw err }
                    return done(null, user)
                })
            }

        })

    }))

    /**************************linkedin sign up**************************************/
    passport.use(new LinkedInStrategy({
        consumerKey: configAuth.linkedinAuth.consumerKey,
        consumerSecret: configAuth.linkedinAuth.consumerSecret,
        callbackURL: configAuth.linkedinAuth.callbackURL,
        passReqToCallback : true
    },
    function(req, token, refreshToken, profile, done) {
        console.log('linkedin:', profile)
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'linkedin.id' : profile.id }, function(err, user) {
                    if (err) { return done(err) }

                    if (user) {
                        if (!user.linkedin.token) {
                            user.linkedin.token = token
                            user.linkedin.name = profile.displayName

                            user.save(function(err) {
                                if (err) { throw err }
                                return done(null, user)
                            })
                        }
                        return done(null, user)
                    } else {
                        var newUser = new User()
                        newUser.linkedin.id = profile.id
                        newUser.linkedin.token = token
                        newUser.linkedin.name = profile.displayName

                        newUser.save(function(err) {
                            if (err) { throw err }
                            return done(null, newUser)
                        })
                    }
                })
            } else {
                var user = req.user
                user.linkedin.id = profile.id
                user.linkedin.token = token
                user.linkedin.name = profile.displayName
                user.save(function(err) {
                    if (err) { throw err }
                    return done(null, user)
                })
            }

        })

    }))

    /**************************github sign up**************************************/
    passport.use(new GithubStrategy({
        clientID: configAuth.githubAuth.clientID,
        clientSecret: configAuth.githubAuth.clientSecret,
        callbackURL: configAuth.githubAuth.callbackURL,
        passReqToCallback : true
    },
    function(req, token, refreshToken, profile, done) {
        console.log('github:', profile)
        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'github.id' : profile.id }, function(err, user) {
                    if (err) { return done(err) }

                    if (user) {
                        if (!user.github.token) {
                            user.github.token = token
                            user.github.name = profile.displayName
                            user.github.username = profile.username
                            user.github.url = profile.profileUrl
                            user.github.email = profile.emails[0].value

                            user.save(function(err) {
                                if (err) { throw err }
                                return done(null, user)
                            })
                        }
                        return done(null, user)
                    } else {
                        var newUser = new User()
                        newUser.github.id = profile.id
                        newUser.github.token = token
                        newUser.github.name = profile.displayName
                        newUser.github.username = profile.username
                        newUser.github.url = profile.profileUrl
                        newUser.github.email = profile.emails[0].value

                        newUser.save(function(err) {
                            if (err) { throw err }
                            return done(null, newUser)
                        })
                    }
                })
            } else {
                var user = req.user
                user.github.id = profile.id
                user.github.token = token
                user.github.name = profile.displayName
                user.github.username = profile.username
                user.github.url = profile.profileUrl
                user.github.email = profile.emails[0].value
                user.save(function(err) {
                    if (err) { throw err }
                    return done(null, user)
                })
            }

        })

    }))

} // end of module.exports function
