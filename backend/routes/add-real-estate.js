let express = require("express");
let router = express.Router();
const bodyParser = require("body-parser");
let authenticate = require("../authenticate");
var multer = require('multer');
const crypto = require('crypto');
const queryString = require('query-string');
var path = require("path");
let fs = require('fs-extra');
let RealEstate = require("../models/real-estate");

let extensions = {
    "image/png": ".png",
    "image/jpg": ".jpg",
    "image/jpeg": ".jpeg"
}

//configuration for real estate image upload
var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        let folderId = crypto.randomBytes(20).toString('hex');
        let path = `real-estates/${folderId}/`;
        fs.mkdirsSync(path);
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
})
//real estate image restrictions
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        const ext = path.extname(file.originalname);
        if (file.mimetype in extensions)
            return callback(null, true)
        callback(null, false)
    },
    limits: {
        fileSize: 10240 * 10240,
        files: 1
    }
}).single('avatar');

// route which will handle adding a real estate
router.post('/', authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
            return res.status(400)
                .json({
                    message: "Molimo unesite sliku manje velicine (do 20mb). ",
                    success: false
                });
        }
        if (!req.file) {
            return res.status(400)
                .json({
                    message: "Molimo unesite sliku u formatu .png, .jpg, .jpeg i pokusajte ponovo. ",
                    success: false
                });
        } else {
            let reqBody = req.body.realestateproperties
            reqBody = JSON.parse(reqBody)
            reqBody["mainPhotoId"] = req.file.filename
            reqBody["folderId"] = req.file.destination.substring(req.file.destination.indexOf('/') + 1)
            const realEstate = new RealEstate(reqBody);

            realEstate
                .save()
                .then((document) => {
                    res.setHeader("Content-Type", "application/json");
                    res.status(200).json({ success: true, data: document, message: 'Nekretnina je uspešno uneta u bazu!' });
                })
                .catch((error) => {
                    res.setHeader("Content-Type", "application/json");
                    const responseObject = errorHandler(error)
                    fs.unlink(`real-estates/${reqBody["folderId"]}/${reqBody["mainPhotoId"]}`, function (err) {
                        if (err) {
                            console.log(`Neuspesno brisanje slike: real-estates/${reqBody["folderId"]}/${reqBody["mainPhotoId"]}
                            Greska: ${err}`);
                            res.status(responseObject.status).json({ success: responseObject.success, message: responseObject.message });
                        }
                        else {
                            console.log(`Obrisana slika: real-estates/${reqBody["folderId"]}${reqBody["mainPhotoId"]}`);
                            fs.rmdir(`real-estates/${reqBody["folderId"]}`, (err) => {
                                if (err)
                                    console.log(`Neuspesno brisanje foldera: real-estates/${reqBody["folderId"]}
                                    Greska: ${err}`);
                                else
                                    console.log(`Obrisan folder: real-estates/${reqBody["folderId"]}`);
                                res.status(responseObject.status).json({ success: responseObject.success, message: responseObject.message });
                            });
                        }
                    })
                }
                );
        }
    })
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
