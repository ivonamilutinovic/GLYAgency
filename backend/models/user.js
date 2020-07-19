var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname: {
      type: String,
      required: [true, 'Ime je obavezno']
    },
    lastname: {
      type: String,
      required: [true, 'Prezime je obavezno'],
    },
    image: {
      type: String,
      default: './users/user-default.jpg'
    },
    description: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    admin: {
      type: Boolean,
      default: false
    },
	estates:{
		type: [String],
		default: []
	},
});


User.plugin(passportLocalMongoose,  { usernameField : 'email' });

module.exports = mongoose.model('User', User);