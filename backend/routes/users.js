var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var passport = require('passport');
var authenticate = require('../authenticate');
var validator = require("email-validator");
var User = require('../models/user');
var fs = require("fs");
let fse = require('fs-extra')
var multer = require('multer');
const crypto = require('crypto');
var path = require("path");

router.use(bodyParser.json());

router.options('*',(req, res) => { res.sendStatus(200); } )

// route which will handle sign up requests
router.post('/signup', (req, res, next) => {
  if(req.body.email === undefined){
    res.status(400);
    res.setHeader('Content-Type', 'application/json');
    res.json({success: false, statusMessage: 'Email je obavezan!'});
  }    
  if(!validator.validate(req.body.email)){
    res.status(400);
    res.setHeader('Content-Type', 'application/json');
    res.json({success: false, statusMessage: 'Prosleđeni email nije validan!'});
  }
  else{
    User.register(new User({email: req.body.email, firstname: req.body.firstname, lastname: req.body.lastname}), 
      req.body.password, (err, user) => {
      if(err) {
        res.status(400);
        res.setHeader('Content-Type', 'application/json');
        if(err.name === 'UserExistsError')
          res.json({success: false, statusMessage: 'Email je već registrovan', err : err });  
        else if(err.name === 'MissingPasswordError')
          res.json({success: false, statusMessage: 'Lozinka je obavezna', err : err });
        else if (err.name ==='ValidationError'){
         for (first in err.errors){
          res.json({success: false, statusMessage: err.errors[first].message, err : err }); 
          break;
         }
        }
        else
          res.json({success: false, statusMessage:'Registracija nije uspela, pokušajte ponovo', err : err });
      }
      else {
        passport.authenticate('local')(req, res, () => {
          var token = authenticate.getToken({_id: user._id});
          res.status(200);
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, statusMessage: 'Registacija uspešna!', admin: false, _id: user._id, token: token});
        });
      }
      });
  }
});

// route which will handle log in requests
router.post('/login', (req, res, next) => {

  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);

    if (!user) {
      res.status(401);
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, statusMessage: 'Neispravan je email ili lozinka'});
    }
    else{
      req.logIn(user, (err) => {
        if (err) {
          res.status(401);
          res.setHeader('Content-Type', 'application/json');
          res.json({success: false, statusMessage: 'Prijava nije moguća', err: err});          
        }
        else {
        var token = authenticate.getToken({_id: req.user._id});
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, statusMessage: 'Prijava uspešna!', admin: user.admin, _id: user._id, token: token});
        }
      }); 
    }
  }) (req, res, next);
});

// route which will handle change password request
router.post('/changepassword', authenticate.verifyUser, function(req, res) {

  User.findOne({ email: req.body.email },(err, user) => {
    // Check if error connecting
    if (err) {
      res.status(500);
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, statusMessage: 'Promena lozinke nije moguća', err: err}); 
    } else {
      // Check if user was found in database
      if (!user) {
        res.status(404);
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, statusMessage: 'Korisnik nije pronađen'}); 
      } else {
        user.changePassword(req.body.oldpassword, req.body.newpassword, function(err) {
           if(err) {
                    res.setHeader('Content-Type', 'application/json');
                    if(err.name === 'IncorrectPasswordError'){
                      res.status(404);
                      res.json({ success: false, statusMessage: 'Pogrešna lozinka', err: err }); 
                    } else {
                      res.status(400);
                      res.json({ success: false, statusMessage: 'Promena lozinke nije moguća', err: err });
                    }
          } else {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, statusMessage: 'Lozinka je uspešno promenjena!' });
           }
         })
      }
    }
  });   
});

// route which will handle change user data requests 
router.post('/changedata', authenticate.verifyUser, (req, res) => {
  User.findOne({ email: req.body.email }).select('-estates')
  .exec((err, user) => {
    if(err){
      res.status(500);
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, statusMessage: 'Promena podataka nije moguća', err: err});
    }
    else{
      if(!user){
        res.status(404);
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, statusMessage: 'Korisnik nije pronađen'});
      }
      else{
        if(req.body.firstname)
          user.firstname = req.body.firstname;
        if(req.body.lastname)
          user.lastname = req.body.lastname;
        if(req.body.phone)
          user.phone = req.body.phone;
        if(req.body.description)
          user.description = req.body.description;
        user.save((err, user) => {
          if(err){
            res.status(400);
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, statusMessage: 'Neuspešna promena, pokušajte ponovo', err : err }); 
          }
          else{
			if(user.admin)
				user.image = 'data:image/jpg;base64,' + new Buffer.from(fs.readFileSync(user.image)).toString("base64");
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, statusMessage: 'Podaci su uspešno promenjeni', user: user});
          }
        });
      }
    }
  });
});

// route which will check whether provided token is valid or not
router.get('/checkJWTtoken', (req, res) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err)
      next(err);
    
    if (!user) {
      res.status(401);
      res.setHeader('Content-Type', 'application/json');
      res.json({statusMessage: 'Token nije validan!', success: false});
    }
    else {
      res.status(200);
      res.setHeader('Content-Type', 'application/json');
      res.json({statusMessage: 'JWT validan!', success: true, user: user});

    }
  }) (req, res);
});

// route which will handle get user data with forwarded _id requests
router.get('/user/:id', authenticate.verifyUser, (req,res,next) => {
  User.findOne({_id: req.params.id}).select('-estates')
  .then((user) => {
    if(!user){
      res.status(404);
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, statusMessage: 'Korisnik nije pronađen'}); 
    }
    else {
      res.status(200);
	  if(user.admin)
		user.image = 'data:image/jpg;base64,' + new Buffer.from(fs.readFileSync(user.image)).toString("base64");
      res.setHeader('Content-Type', 'application/json');
      res.json(user);
      }
  }, (err) => next(err))
  .catch((err) => {
    res.status(400);
    res.setHeader('Content-Type', 'application/json');
    res.json({success: false, statusMessage: 'Neuspešan zahtev, pokušajte ponovo', err:err});

  });
});

//route which will handle get all agency agents request
router.get('/', (req,res,next) => {
  User.find({admin : true}).select('-estates')
  .then((users) => {
	  // get user photos and replace user.image with its base64 representation
	  for (var i = 0; i < users.length; i++) {
		  users[i].image = 'data:image/jpg;base64,' + new Buffer.from(fs.readFileSync(users[i].image)).toString("base64");
	  }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
  }, (err) => next(err))
  .catch((err) => {
    res.status(400);
    res.setHeader('Content-Type', 'application/json');
    res.json({success: false, statusMessage: 'Neuspešan zahtev, pokušajte ponovo', err:err});
  });
});

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    let folderId = crypto.randomBytes(20).toString('hex');
    let path = `users/${folderId}/`;
    fse.mkdirsSync(path);
    callback(null, path);
  },
  filename: function (req, file, callback) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return callback(err);
        let ext = path.extname(file.originalname);
        if (ext == "")
            ext = extensions[file.mimetype]
        callback(null, raw.toString('hex') + ext);
    });
  }
});

const imageFileFilter = (req, file, callback) => {
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Podržane ekstenzije su jpg, jpeg, png i gif!'), false);
  }
  callback(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

// route which will handle changing user photo with forwarded _id and photo request
router.post('/photoupload', upload.single('imageFile'), (req, res) => {
  User.findOne({ _id: req.body._id }).select('-estates')
  .exec((err, user) => {
    if(err){
      res.status(500);
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false, statusMessage: 'Promena podataka nije moguća', err: err});
    }
    else{
      if(!user){
        res.status(404);
        res.setHeader('Content-Type', 'application/json');
        res.json({success: false, statusMessage: 'Korisnik nije pronađen'});
      }
      else{
          user.image =  './' + req.file.path.replace('\\', '/').replace('\\', '/');
        user.save((err, user) => {
          if(err){
            res.status(400);
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, statusMessage: 'Neuspešna promena, pokušajte ponovo', err : err }); 
          }
          else{
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            let image = 'data:image/jpg;base64,' + new Buffer.from(fs.readFileSync(user.image)).toString("base64");
            res.json({success: true, statusMessage: 'Slika uspešno promenjena', image: image});
          }
        });
      }
    }
  });
  
});

module.exports = router;



