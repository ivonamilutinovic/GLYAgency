const mongoose = require("mongoose");
require("mongoose-type-email");
//const validate = require('mongoose-validator')
var emailValidator = require("email-validator");
const Schema = mongoose.Schema;

/* Alternative way of form validation, possible use in later sprints */

/* var nameValidator = [
  validate({
    validator: 'isLength',
    arguments: [8, 12],
    message: 'Ime mora sadrzati izmedju {ARGS[0]} i {ARGS[1]} karaktera. ',
  })]
*/
/* var emailValidator = [
  validate({
    validator: 'isEmail',
    arguments: [],
    message: 'Uneti email nije validan',
  })] */
/*
var phoneValidator = [
  validate({
    validator: 'isLength',
    arguments: [9, 18],
    message: 'Telefon mora sadrzati izmedju {ARGS[0]} i {ARGS[1]} karaktera. ',
  })]

var cooperationTypeValidator = [
  validate({
    validator: 'isIn',
    arguments: ["sale", "rent"],
    message: 'Tip saradnje mora biti ili prodaja ili izdavanje. ',
  })]

var cityValidator = [
  validate({
    validator: 'isIn',
    arguments: ["bg", "ns"],
    message: 'Grad mora biti ili Beograd ili Novi Sad. ',
  })] */

function validatorEmail(email) {
  return emailValidator.validate(email);
};
function validatorName(name) {
  return (typeof (name) == "string" || typeof (name) == "number");
};

/* Mongoose shape and validation with schema for real estate offer form */
let RealEstateOffer = new Schema({
  name: {
    required: [true, 'Ime je obavezno. '],
    type: String,
    validate: [validatorName, 'Ime mora biti tipa string. '],
    //validate: nameValidator,
    //maxlength: [25, 'Maksimalan broj karaktera za ime je 25 karaktera. '],
    //minlength: [3, 'Minimalan broj karaktera za ime je 3 karaktera. ']
  },
  email: {
    //validate: emailValidator
    validate: [validatorEmail, 'Email mora biti u ispravnom obliku. '],
    required: [true, 'Email je obavezan. '],
    type: mongoose.SchemaTypes.Email,

  },
  phone: {
    type: String,
    //validate: phoneValidator,
    required: [true, 'Telefon je obavezan. '],
    maxlength: [18, 'Maksimalan broj karaktera za telefon je 18 karaktera. '],
    minlength: [9, 'Minimalan broj karaktera za telefon je 9 karaktera. ']
  },
  cooperationType: {
    type: String,
    required: [true, 'Tip saradnje je obavezan. '],
    //validate: cooperationTypeValidator
    enum: { values: ['sale', 'rent'], message: 'Tip saradnje mora biti ili prodaja ili izdavanje. ' }
  },
  city: {
    type: String,
    required: [true, 'Grad je obavezan'],
    enum: { values: ['bg', 'ns'], message: 'Grad mora biti ili Beograd ili Novi Sad. ' }
    //validate: cityValidator
  },
  agentId: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model("RealEstateOffer", RealEstateOffer);
