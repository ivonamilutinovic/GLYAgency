var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); 

var config = require('./config.js');

// passport strategy with an email as a primate instrad of an username 
exports.local = passport.use(new LocalStrategy({
    usernameField: 'email',
    usernameQueryFields: ['email'],
    passwordField: 'password'
  }, User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// function which will generate token for user with expire time set to 7 days
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 604800});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// function which will authenticate the user with provided token
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

// function which will check whether the client is logged or not
exports.verifyUser = passport.authenticate('jwt', {session: false});

// function which will check whether the user is admin(agent) or not
exports.verifyAdmin = function(req, res, next) {
    User.findOne({_id: req.user._id})
    .then((user) => {
        if (user.admin) {
            next();
        }
        else {
            err = new Error('Nije Vam dozvoljeno da izvršite ovu operaciju!');
            err.status = 403;
            return next(err);
        } 
    }, (err) => next(err))
    .catch((err) => next(err))
}
