require('dotenv').config();

const cors = require('cors')
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const initializePassport = require('./passport-config');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const PORT = process.env.PORT || 3000;

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

initializePassport(
	passport,
	(email) => users.find((user) => user.email === email),
	(id) => users.find((user) => user.id === id),
);

users = [];
app.use(express.json())
app.use(cors())

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	}),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.set('view-engine', 'ejs');

app.get('/', chechauthenticated, (req, res) => {
	res.render('index.ejs', { name: req.user.name });
});

app.get('/login', chechNOtauthenticated, (req, res) => {
	res.render('login.ejs');
});
app.post(
	'/login',
	chechNOtauthenticated,
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true,
	}),
);

app.get('/register', chechNOtauthenticated, (req, res) => {
	res.render('register.ejs');
});

app.post('/register', chechNOtauthenticated, async (req, res) => {
	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		users.push({
			id: Date.now().toString(),
			name: req.body.name,
			email: req.body.email,
			password: hashedPassword,
		});

		res.redirect('/login');
	} catch (error) {
		res.redirect('/register');
	}
	console.log(users);
});

app.delete('/logout', (req, res, next) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		res.redirect('/login');
	});
});

function chechauthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('/login');
}

function chechNOtauthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	}
	next();
}

app.listen(PORT, console.log(PORT));
