'use strict'

let express  = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	flash    = require('connect-flash'),
	http = require('http')

let app  = express()
const port     = process.env.PORT || 8080
const configDB = 'mongodb://localhost/socialdb'

mongoose.connect(configDB)

require('./config/passport')(passport) // pass passport object to auth functions

app.use(express.logger('dev'))
app.use(express.cookieParser()) // coookies for auth
app.use(express.bodyParser()) // parses html forms
app.use(express.session({ secret: 'fghwj67754wegn456fdy65eujtrh' })) // session secret
app.use(passport.initialize())
app.use(passport.session()) // persistent login sessions
app.use(flash()) // use for flash messages stored in session

app.set('view engine', 'ejs')

// load routes and pass in app and configured passport
require('./app/routes.js')(app, passport)

// create server object
let server = http.createServer(app)
// booting up server function
let boot = function() {
	server.listen(port, function() {
		console.log('Express server listening on port ', port)
	})
}
// shutdown server function
let shutdown = function() {
	server.close()
}

// if main module then start server else pass to exports
if(! require.parent){
	boot()
} else {
	console.log('Running ap as module')
	module.exports = {
		boot: boot,
		shutdown: shutdown,
		port: port,
		server: server,
		app: app
	}
}
