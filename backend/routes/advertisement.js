let express = require("express");
let router = express.Router();
var bodyParser = require("body-parser");
let authenticate = require("../authenticate");
let { DateTime } = require('luxon');
let RealEstate = require("../models/real-estate");

router.use(bodyParser.json());

router.options("*", (req, res) => {
    res.sendStatus(200);
});

//route which will handle request for single real estate
router.get("/:advertisementId/:userId", function (req, res, next) {
    RealEstate.findOne({ _id: req.params.advertisementId }).select({
        "monthlyExpenses": 0,
        "mainPhotoId": 0,
        "_v": 0,
        "appointments": 0
    })
        .then(result => {
            result = JSON.parse(JSON.stringify(result));
            let imagesResponse = []
            fs.readdir(`real-estates/${result["folderId"]}`, (error, images) => {
                images.forEach(image => {
                    imagesResponse.push(image)
                });
                let userId = req.params.userId
                if (userId != "undefined") {
                    if (result["users"].includes(userId))
                        result["addedToFavorites"] = true
                    else
                        result["addedToFavorites"] = false
                }
                delete result["users"]

                result = JSON.parse(JSON.stringify(result));
                result["images"] = imagesResponse
                res.json(result)
            });
        })
        .catch(err => res.status(404).json({ success: false, message: err.message }));
});

//route which will handle user's request for appointment
router.post("/make-appointment", authenticate.verifyUser, function (req, res, next) {
    let monthNameToNumber = {
        "Januar": "01",
        "Februar": "02",
        "Mart": "03",
        "April": "04",
        "Maj": "05",
        "Jun": "06",
        "Jul": "07",
        "Avgust": "08",
        "Septembar": "09",
        "Oktobar": "10",
        "Novembar": "11",
        "Decembar": "12"
    }
    let isAvailable = true
    let appointmentInfo = req.body

    let day;
    if (appointmentInfo["day"] < 10)
        day = '0' + appointmentInfo["day"]
    else
        day = appointmentInfo["day"]

    let time = (appointmentInfo["time"]).split('.')
    if (time[0] < 10)
        time[0] = '0' + time[0]
    time = time.join(':')
    let dateTime = DateTime.fromISO(`${appointmentInfo["year"]}-${monthNameToNumber[appointmentInfo["month"]]}-${day}T${time}:00`,
        { setZone: true, zone: "Europe/Belgrade" });
    let dateTimeISO = dateTime.toISO()

    RealEstate.findById(appointmentInfo["realEstateId"])
        .then(result => {
            let appointmentDate = new Date(dateTimeISO)
            for (let i = 0; i < result["appointments"].length; i++) {
                let busyDate = new Date(result["appointments"][i]["date"])
                if (appointmentDate.toString() == busyDate.toString()) {
                    isAvailable = false
                    res.setHeader("Content-Type", "application/json");
                    res.status(400).json({ success: false, message: 'Termin zauzet, izaberite drugi termin ' });
                    break;
                }
                else if (result["appointments"][i]["userId"] == appointmentInfo["userId"]) {
                    isAvailable = false
                    res.setHeader("Content-Type", "application/json");
                    res.status(400).json({ success: false, message: 'Već ste izabrali termin za gledanje ove nekretnine ' });
                    break;
                }
            }
            if (isAvailable) {
                result["appointments"].push({
                    "userId": appointmentInfo["userId"],
                    "date": dateTimeISO
                })
                result.save()
                    .then((document) => {
                        res.setHeader("Content-Type", "application/json");
                        res.status(200).json({ success: true, data: document, message: 'Uspešno dodat termin ' });
                    })
                    .catch((error) => {
                        const responseObject = errorHandler(error)
                        res.setHeader("Content-Type", "application/json");
                        res.status(responseObject.status).json({ success: responseObject.success, message: responseObject.message });
                    })
            };
        }).catch((error) => {
            const responseObject = errorHandler(error)
            res.setHeader("Content-Type", "application/json");
            res.status(responseObject.status).json({ success: responseObject.success, message: responseObject.message });
        });;
});


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