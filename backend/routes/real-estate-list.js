let express = require("express");
let router = express.Router();
const bodyParser = require("body-parser");
let authenticate = require("../authenticate");
const queryString = require('query-string');
let RealEstate = require("../models/real-estate");

router.use(bodyParser.json());

router.options("*", (req, res) => {
    res.sendStatus(200);
});


/* route for handling extended search for real estate */
router.get("/extended-search", function (req, res, next) {

    const unreadyParsedParams = queryString.parse(req.url.substr(req.url.indexOf('?') + 1), { arrayFormat: 'bracket' });
    const readyParsedParams = JSON.parse(JSON.stringify(unreadyParsedParams));

    const mongooseDictionaryNames = ["buildingEquipment", "realEstateEquipment"]
    const mongooseArrayNames = ["additionalSpace"]

    let queryParam = {};

    let userId = readyParsedParams["userId"]
    delete readyParsedParams["userId"]

    for (let param in readyParsedParams) {
        if (readyParsedParams.hasOwnProperty(param)) {
            if (param.endsWith('Max')) {
                let tmp = param.substr(0, param.length - 3)
                if (!readyParsedParams.hasOwnProperty(tmp.concat("Min")))
                    queryParam[tmp] = { $lte: parseInt(readyParsedParams[param]) }
                else {
                    queryParam[tmp] = { $lte: parseInt(readyParsedParams[param]), $gte: parseInt(readyParsedParams[tmp.concat("Max")]) }
                    delete readyParsedParams[tmp.concat("Max")]
                }
            }
            else if (param.endsWith('Min')) {
                let tmp = param.substr(0, param.length - 3)
                if (!readyParsedParams.hasOwnProperty(tmp.concat("Max")))
                    queryParam[tmp] = { $gte: parseInt(readyParsedParams[param]) }
                else {
                    queryParam[tmp] = { $gte: parseInt(readyParsedParams[param]), $lte: parseInt(readyParsedParams[tmp.concat("Min")]) }
                    delete readyParsedParams[tmp.concat("Min")]
                }
            }
            else if (Array.isArray(readyParsedParams[param])) {
                if (isInArray(param, mongooseArrayNames))
                    queryParam[param] = { $all: readyParsedParams[param] }
                else
                    queryParam[param] = { $in: readyParsedParams[param] }
            }
            else if (isInArray(param, mongooseDictionaryNames)) {
                for (let subParam in readyParsedParams[param])
                    if (readyParsedParams[param].hasOwnProperty(subParam))
                        queryParam[param.concat(".", subParam)] = true
            }
            else if (param == "street")
                queryParam["$text"] = {
                    $search: readyParsedParams[param],
                    $caseSensitive: false,
                    $diacriticSensitive: false
                }
            else queryParam[param] = readyParsedParams[param]
        }
    }
    RealEstate.find(queryParam).select({
        "folderId": 1,
        "mainPhotoId": 1,
        "_id": 1,
        "street": 1,
        "community": 1,
        "price": 1,
        "m2": 1,
        "struct": 1,
        "users": 1
    })
        .then(result => {
            result = JSON.parse(JSON.stringify(result));
            if (!Array.isArray(result))
                result = [result]
            if (userId != "undefined") {
                result.forEach(realEstate => {
                    if (realEstate["users"].includes(userId))
                        realEstate["addedToFavorites"] = true
                    else
                        realEstate["addedToFavorites"] = false
                    delete realEstate["users"]
                })
            }
            res.json(result)
        })
        .catch(err => res.status(404).json({ success: false, message: err.message }));


});


/* route for handling brief search for real estate */
router.get("/brief-search", function (req, res, next) {

    const unreadyParsedParams = queryString.parse(req.url.substr(req.url.indexOf('?') + 1), { arrayFormat: 'bracket' });
    const readyParsedParams = JSON.parse(JSON.stringify(unreadyParsedParams));

    let userId = readyParsedParams["userId"]
    delete readyParsedParams["userId"]

    const exactParameters = ["cooperation", "city", "type"]
    let queryParam = {};

    for (let param in readyParsedParams) {
        if (readyParsedParams.hasOwnProperty(param)) {
            if (isInArray(param, exactParameters))
                queryParam[param] = readyParsedParams[param]
            else if (param == "priceMax") {
                queryParam["price"] = { $lte: parseInt(readyParsedParams[param]) }

            }
            else if (param == "m2Min") {
                queryParam["m2"] = { $gte: parseInt(readyParsedParams[param]) }
            }
        }
    }
    RealEstate.find(queryParam).select({
        "folderId": 1,
        "mainPhotoId": 1,
        "_id": 1,
        "street": 1,
        "community": 1,
        "price": 1,
        "m2": 1,
        "struct": 1,
        "users": 1
    })
        .then(result => {
            result = JSON.parse(JSON.stringify(result));
            if (!Array.isArray(result))
                result = [result]
            if (userId != "undefined") {
                result.forEach(realEstate => {
                    if (realEstate["users"].includes(userId))
                        realEstate["addedToFavorites"] = true
                    else
                        realEstate["addedToFavorites"] = false
                    delete realEstate["users"]
                })
            }
            res.json(result);
        })
        .catch(err => res.status(404).json({ success: false, message: err.message }));
});


/* route for handling quick search for real estate */
router.get("/quick-search", function (req, res, next) {
    const unreadyParsedParams = queryString.parse(req.url.substr(req.url.indexOf('?') + 1), { arrayFormat: 'bracket' });
    const readyParsedParams = JSON.parse(JSON.stringify(unreadyParsedParams));

    let userId = readyParsedParams["userId"]
    delete readyParsedParams["userId"]

    const selectOfferedParameters = ["cooperation", "city"]

    let queryParam = {};

    if (readyParsedParams.hasOwnProperty("q")) {
        queryParam["$text"] = {
            $search: readyParsedParams["q"],
            $caseSensitive: false,
            $diacriticSensitive: false
        }
        delete readyParsedParams["q"]
        for (let param in readyParsedParams) {
            if (readyParsedParams.hasOwnProperty(param)) {
                if (isInArray(param, selectOfferedParameters))
                    queryParam[param] = readyParsedParams[param]
            }
        }
        /* 
        RealEstate.index({ street: "text" })
        RealEstate.createIndexes(); 
        */
        RealEstate.find(queryParam).select({
            "folderId": 1,
            "mainPhotoId": 1,
            "_id": 1,
            "street": 1,
            "community": 1,
            "price": 1,
            "m2": 1,
            "struct": 1,
            "users": 1
        })
            .then(result => {
                result = JSON.parse(JSON.stringify(result));
                if (!Array.isArray(result))
                    result = [result]
                if (userId != "undefined") {
                    result.forEach(realEstate => {
                        if (realEstate["users"].includes(userId))
                            realEstate["addedToFavorites"] = true
                        else
                            realEstate["addedToFavorites"] = false
                        delete realEstate["users"]
                    })
                }
                res.json(result);
            })
            .catch(err => res.status(404).json({ success: false, message: err.message }));
    }
    else {
        res.status(400).json({ success: false, message: "Molimo unesite ID nekretnine ili naziv ulice" })
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

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function isTextInputRealEstateId(textInput) {
    return textInput == parseInt(textInput);
}

module.exports = router;
