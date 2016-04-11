'use strict'

/*
* To add new account need to create authentication, authorization, and unlink methods.
* i.e. 	****twitter authentication****
*			// scope is waht you info you are wanting to get from api - api specific inputs
*			app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }))
*			app.get('/auth/twitter/callback', passport.authenticate('twitter', {
*			successRedirect : '/profile', failureRedirect : '/'}))
*		****twitter authorized****
*			app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }))
*			app.get('/connect/twitter/callback', passport.authorize('twitter', {
*				successRedirect : '/profile', failureRedirect : '/'}))
*		****twitter unlink****
*			app.get('/unlink/twitter', function(req, res) {
*				let user = req.user
*				// delete token to disable account access
*				user.twitter.token = undefined
*				user.save(function(err) {
*					res.redirect('/profile')
*				})
*			})
*/

module.exports = function(app, passport) {

	/******************************normal routes***************************************/
	// show home page
	app.get('/', function(req, res) {
		res.render('index.ejs')
	})
	// show profile page
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		})
	})
	// logout page
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/')
	})

	/*******************************local authentication****************************/
	// show login page
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') })
	})

	// process a login
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // if success redirect to profile page
		failureRedirect : '/login', // if failure rediect to login page
		failureFlash : true // allow flash messages
	}))

	// process a login manually
	/*
	app.post('/login', function(req, res, next) {
		// call auth method inside express req handler
		passport.authenticate('local-signup', function(err, user, info) {
			// if server error send 500 error
			if (err) { next(err) }
			// if auth error redirect to signup page
			if (! user) { return res.redirect('/login') }
			// if succeed then redirect to profile
			req.login(user, function(err) {
				if (err) { return next(err) }
				return res.redirect('/profile')
			})
		})(req, res, next)
	})*/

	/******show sign up page*****/
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('loginMessage') })
	})

	/******process a sign up*****/
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash : true
	}))






	/****************************facebook authentication***************************/
	app.get('/auth/facebook', passport.authenticate('facebook', { 
		// what data app is allowed to get from facebook
		scope : ['email','user_friends','public_profile']
	}))
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))

	/******************************twitter authentication*************************/
	app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }))
	app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))

	/*****************************google authentication*****************************/
	app.get('/auth/google', passport.authenticate('google', {
	 scope : ['profile', 'email'] 
	}))
	app.get('/auth/google/callback', passport.authenticate('google', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))

	/*****************************instagram authentication*****************************/
	app.get('/auth/instagram', passport.authenticate('instagram', { scope : ['basic'] }))
	app.get('/auth/instagram/callback', passport.authenticate('instagram', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))

	/*****************************linkedin authentication*****************************/
	app.get('/auth/linkedin', passport.authenticate('linkedin'))
	app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))

	/*****************************github authentication*****************************/
	app.get('/auth/github', passport.authenticate('github', { 
		scope: ['user'] 
	}))
	app.get('/auth/github/callback', passport.authenticate('github', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))






	/*******************************locally authorized******************************/
	app.get('/connect/local', function(req, res) {
		res.render('connect-local.ejs', { message: req.flash('loginMessage') })
	})
	app.post('/connect/local', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/connect/local',
		failureFlash : true
	}))

	/******************************facebook authorized******************************/
	app.get('/connect/facebook', passport.authorize('facebook', { 
		scope : ['email','user_friends','public_profile']
	}))

	app.get('/connect/facebook/callback', passport.authorize('facebook', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))

	/**************************twitter authorized***********************************/
	app.get('/connect/twitter', passport.authorize('twitter', { 
		scope : 'email' 
	}))

	app.get('/connect/twitter/callback', passport.authorize('twitter', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}))

	/**************************google authorized**********************************/
	app.get('/connect/google', passport.authorize('google', { 
		scope: ['profile', 'email'] 
	}))

	app.get('/connect/google/callback', passport.authorize('google', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}))

	/**************************instagram authorized**********************************/
	app.get('/connect/instagram', passport.authorize('instagram', { 
		scope: ['basic','public_content']
	}))

	app.get('/connect/instagram/callback', passport.authorize('instagram', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}))
	/**************************linkedin authorized**********************************/
	app.get('/connect/linkedin', passport.authorize('linkedin'))

	app.get('/connect/linkedin/callback', passport.authorize('linkedin', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}))
	/**************************github authorized**********************************/
	app.get('/connect/github', passport.authorize('github', { 
		scope: ['user']
	}))

	app.get('/connect/github/callback', passport.authorize('github', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}))






	/***************************unlink local account******************************/
	app.get('/unlink/local', function(req, res) {
		let user = req.user
		user.local.email = undefined
		user.local.password = undefined
		user.save(function(err) {
			res.redirect('/profile')
		})
	})
	/**************************unlink facebook account***************************/
	app.get('/unlink/facebook', function(req, res) {
		let user = req.user
		user.facebook.token = undefined
		user.save(function(err) {
			res.redirect('/profile')
		})
	})
	/***************************unlink twitter account***************************/
	app.get('/unlink/twitter', function(req, res) {
		let user = req.user
		user.twitter.token = undefined
		user.save(function(err) {
			res.redirect('/profile')
		})
	})
	/**************************unlink google account****************************/
	app.get('/unlink/google', function(req, res) {
		let user = req.user
		user.google.token = undefined
		user.save(function(err) {
			res.redirect('/profile')
		})
	})
	/**************************unlink instagram account****************************/
	app.get('/unlink/instagram', function(req, res) {
		let user = req.user
		user.instagram.token = undefined
		user.save(function(err) {
			res.redirect('/profile')
		})
	})
	/**************************unlink linkedin account****************************/
	app.get('/unlink/linkedin', function(req, res) {
		let user = req.user
		user.linkedin.token = undefined
		user.save(function(err) {
			res.redirect('/profile')
		})
	})
	/**************************unlink github account****************************/
	app.get('/unlink/github', function(req, res) {
		let user = req.user
		user.github.token = undefined
		user.save(function(err) {
			res.redirect('/profile')
		})
	})

}






/********** check to see if user is authenticated for profile access***********/
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next() // if authenticated then go to next middleware
	res.redirect('/') // if not authenticated then redirect to home page
}