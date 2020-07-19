let express = require("express");
let router = express.Router();
var bodyParser = require("body-parser");
let authenticate = require("../authenticate");
let RealEstate = require("../models/real-estate");
let User = require("../models/user");

router.use(bodyParser.json());

router.options("*", (req, res) => {
    res.sendStatus(200);
});

router.post("/addtofavorite",  authenticate.verifyUser, function (req, res, next) {
	
	RealEstate.findOne({ _id: req.body.advertisementId }, (err, result) => {
		if (err) {
		  res.status(500);
		  res.setHeader('Content-Type', 'application/json');
		  res.json({success: false, statusMessage: 'Dodavanje u omiljene nije moguće', err: err}); 
		} else {
		if (!result) {
			res.status(404);
			res.setHeader('Content-Type', 'application/json');
			res.json({success: false, statusMessage: 'Nekretnina nije pronađena'}); 
		  } else {
				let estate = result;
				User.findOne({ _id: req.body.userId }, (err, result) => {
				if (err) {
				  res.status(500);
				  res.setHeader('Content-Type', 'application/json');
				  res.json({success: false, statusMessage: 'Dodavanje u omiljene nije moguće', err: err}); 
				} else {
				if (!result) {
					res.status(404);
					res.setHeader('Content-Type', 'application/json');
					res.json({success: false, statusMessage: 'Korisnik nije pronađen'}); 
				  } else {
						let user = result;
						
						if(estate.users.indexOf(req.body.userId)>=0){
							res.status(400);
							res.setHeader('Content-Type', 'application/json');
							res.json({success: false, statusMessage: 'Nekretnina je već u omiljenim' });
						    return;
						}
						
						user.estates.push(req.body.advertisementId);
						estate.users.push(req.body.userId);
				
					  user.save((err, user) => {
					  if(err){
						res.status(400);
						res.setHeader('Content-Type', 'application/json');
						res.json({success: false, statusMessage: 'Neuspešno povezivanje korisnika sa nekretninom, pokušajte ponovo', err : err }); 
					  }
						})
						
						estate.save((err, estate) => {
							  if(err){
								user.estates = user.estates.filter(function(value, index, arr){ return value !== req.body.advertisementId;});
								user.save((err, user) => {
									if(err){
									  res.status(400);
									  res.setHeader('Content-Type', 'application/json');
									  res.json({success: false, statusMessage: 'Interna greška na serveru! Kontaktirajte razvojni tim', err : err }); 
									}
									else {
										res.status(400);
										res.setHeader('Content-Type', 'application/json');
										res.json({success: false, statusMessage: 'Neuspešno povezivanje nekretnine sa korisnikom, pokušajte ponovo', err : err }); 
									}
								})
							  }
							  else{
								res.status(200);
								res.setHeader('Content-Type', 'application/json');
								res.json({success: true, statusMessage: 'Nekretnina uspešno dodata u omiljene'});
							  }
						})
				  }
				}
			})
		  }
		}
	})	
});

router.post("/deletefromfavorite",  authenticate.verifyUser, function (req, res, next) {
	
	RealEstate.findOne({ _id: req.body.advertisementId }, (err, result) => {
		if (err) {
		  res.status(500);
		  res.setHeader('Content-Type', 'application/json');
		  res.json({success: false, statusMessage: 'Brisanje iz omiljenih nije moguće', err: err}); 
		} else {
		if (!result) {
			res.status(404);
			res.setHeader('Content-Type', 'application/json');
			res.json({success: false, statusMessage: 'Nekretnina nije pronađena'}); 
		  } else {
				let estate = result;
				User.findOne({ _id: req.body.userId }, (err, result) => {
				if (err) {
				  res.status(500);
				  res.setHeader('Content-Type', 'application/json');
				  res.json({success: false, statusMessage: 'Brisanje iz omiljenih nije moguće', err: err}); 
				} else {
				if (!result) {
					res.status(404);
					res.setHeader('Content-Type', 'application/json');
					res.json({success: false, statusMessage: 'Korisnik nije pronađen'}); 
				  } else {
						let user = result;
						
						if(estate.users.indexOf(req.body.userId)<0){
							res.status(400);
							res.setHeader('Content-Type', 'application/json');
							res.json({success: false, statusMessage: 'Nekretnina nije u omiljenim' });
						    return;
						}
						
						user.estates = user.estates.filter(function(value, index, arr){ return value !== req.body.advertisementId;});
						estate.users = estate.users.filter(function(value, index, arr){ return value !== req.body.userId;});
				
					  user.save((err, user) => {
					  if(err){
						res.status(400);
						res.setHeader('Content-Type', 'application/json');
						res.json({success: false, statusMessage: 'Neuspešno brisanje nekretnine iz omiljenih, pokušajte ponovo!', err : err }); 
					  }
						})
						
						estate.save((err, success) => {
							  if(err){
								user.estates.push(req.body.advertisementId);
								user.save((err, success) => {
									if(err){
									  res.status(400);
									  res.setHeader('Content-Type', 'application/json');
									  res.json({success: false, statusMessage: 'Interna greška na serveru! Kontaktirajte razvojni tim', err : err }); 
									}
									else{
										res.status(400);
										res.setHeader('Content-Type', 'application/json');
										res.json({success: false, statusMessage: 'Neuspešno brisanje nekretnine iz omiljenih, pokušajte ponovo', err : err }); 
									}
								})
							  }
							  else{
								 res.status(200);
								res.setHeader('Content-Type', 'application/json');
								res.json({success: true, statusMessage: 'Nekretnina uspešno obrisana iz omiljenih'});
							  }
						})
						

				  }
				}
			})
		  }
		}
	})
		
});

router.get("/getmyfavorites/:userId",  authenticate.verifyUser, function(req,res,next) {
	User.findOne({ _id: req.params.userId }, (err, result) => {
		if (err) {
		  res.status(500);
		  res.setHeader('Content-Type', 'application/json');
		  res.json({success: false, statusMessage: 'Pregled omiljenih nije moguć', err: err}); 
		} else {
		if (!result) {
			res.status(404);
			res.setHeader('Content-Type', 'application/json');
			res.json({success: false, statusMessage: 'Nemate omiljenih nekretnina'}); 
		  } else {
			   result = result.estates;
			   RealEstate.find({_id : result}).select({
				"folderId": 1,
				"mainPhotoId": 1,
				"_id": 1,
				"street": 1,
				"community": 1,
				"price": 1,
				"m2": 1,
				"struct": 1
			})
				.then(favorites => {
					if (!Array.isArray(favorites))
						favorites = [favorites]
					res.json(favorites)
				})
				.catch(err => res.status(404).json({ success: false, message: err.message }));
		  }
		}
	})
})
	


module.exports = router;