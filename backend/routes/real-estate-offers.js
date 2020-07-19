let express = require("express");
let router = express.Router();
const bodyParser = require("body-parser");
let validator = require("email-validator");
let authenticate = require("../authenticate");
var mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId;
let RealEstateOffer = require("../models/real-estate-offer");

router.use(bodyParser.json());

router.options("*", (req, res) => {
  res.sendStatus(200);
});
/* route for handling real estate offers */
router.post("/", authenticate.verifyUser, function (req, res, next) {
  const realEstateOffer = new RealEstateOffer({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    cooperationType: req.body.cooperationType,
    city: req.body.city,
  });
  realEstateOffer
    .save()
    .then((document) => {
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({ success: true, data: document, message: 'Uspešno ste poslali nekretninu!' });
    })
    .catch((error) => {
      const responseObject = errorHandler(error)
      res.setHeader("Content-Type", "application/json");
      res.status(responseObject.status).json({ success: responseObject.success, message: responseObject.message });
    }
    );
});

// route for hangling get all estates which are not processed by the agent
router.get("/", authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  RealEstateOffer.find({ agentId: '' })
    .then((offers) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(offers);
    }, (err) => next(err))
    .catch((err) => {
      res.status(400);
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, statusMessage: 'Neuspešan zahtev, pokušajte ponovo', err: err });
    });
});

// route for hangling get all estates processed by the agent with forwarded id
router.get("/offersinprocess/:agentId", authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  RealEstateOffer.find({ agentId: req.params.agentId })
    .then((offers) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(offers);
    }, (err) => next(err))
    .catch((err) => {
      res.status(400);
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, statusMessage: 'Neuspešan zahtev, pokušajte ponovo', err: err });
    });
});

// route for handling add estate to the agent for processing
router.post("/processoffer", authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  RealEstateOffer.findOne({ _id: req.body._id }, (err, offer) => {
    if (err) {
      res.status(500);
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, statusMessage: 'Promena podataka nije moguća', err: err });
    }
    else {
      if (!offer) {
        res.status(404);
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: false, statusMessage: 'Ponuda nije pronađena' });
      }
      else if (offer.agentId !== '') {
        res.status(403);
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: false, statusMessage: 'Ponuda je već u obradi nekog agenta' });
      }
      else {
        offer.agentId = req.body.agentId;
        offer.save((err, offer) => {
          if (err) {
            res.status(400);
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: false, statusMessage: 'Neuspešna promena, pokušajte ponovo', err: err });
          }
          else {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, statusMessage: 'Nekretnina uspešno preuzeta na obradu' });
          }
        });
      }
    }
  });
});

// route for handling agent's delete request for offered real estate or real estate in processing
// by that agent
router.delete("/delete-real-estate/:realEstateOfferId/:agentId",
  authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
    let agentId = req.params.agentId
    let realEstateOfferId = ObjectId(String(req.params.realEstateOfferId))

    if (agentId == "undefined") {
      RealEstateOffer.deleteOne({ _id: realEstateOfferId, agentId: "" })
        .then((result) => {
          if (result["deletedCount"] == 1) {
            res.status(200).json({ success: true, message: "Uspešno obrisana nekretnina " });
          }
          else {
            res.status(204).json({ success: true, message: "Obradu nekretnine preuzeo drugi agent " });
          }
        })
        .catch((error) => {
          res.status(400).json({ success: false, message: 'Neuspešno brisanje nekretnine, pokušajte ponovo ', error: error });
        });
    }
    else {
      RealEstateOffer.deleteOne({ _id: realEstateOfferId, agentId: agentId })
        .then((result) => {
          if (result["deletedCount"] == 1) {
            res.status(200).json({ success: true, message: "Uspešno obrisana nekretnina " });
          }
          else {
            res.status(204).json({ success: true, message: "Nekretnina se ne nalazi u Vašoj obradi " });
          }
        })
        .catch((error) => {
          res.status(400).json({ success: false, message: 'Neuspešno brisanje nekretnine, pokušajte ponovo ', error: error })
        })
    }
  });


/* Function for handling possible validation or server errors */
function errorHandler(error) {
  let responseError = ""
  let status;
  if (error.name == 'ValidationError') {
    status = 422;
    for (let errName in error.errors) {
      if (error.errors[errName].name == 'ValidatorError')
        responseError += error.errors[errName].message
    }
    if (responseError == "") {
      responseError = "Molimo unesite ispravne podatke. "
    }

  }
  else {
    responseError = "Interna greska na serveru. ";
    status = 500
  }
  const responseObject = {
    success: false,
    status: status,
    message: responseError
  }
  return responseObject
}

module.exports = router;
