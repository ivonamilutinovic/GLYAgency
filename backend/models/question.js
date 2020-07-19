const mongoose = require("mongoose");
require("mongoose-type-email");
var emailValidator = require("email-validator");
const Schema = mongoose.Schema;


function validatorEmail(email) {
    return emailValidator.validate(email);
};
function validatorQuestion(question) {
    return (typeof (question) == "string");
};

let Question = new Schema({
    email: {
        required: [true, 'Email je obavezan. '],
        validate: [validatorEmail, 'Email u neispravnom obliku. '],
        type: mongoose.SchemaTypes.Email
    },
    question: {
        validate: [validatorQuestion, 'Pitanje je u neprepoznatljivom obliku. '],
        required: [true, 'Polje sa pitanjem je obavezno. '],
        type: String,
    },
});


module.exports = mongoose.model("Question", Question);