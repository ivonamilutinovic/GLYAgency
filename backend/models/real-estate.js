const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const appointmentSubSchema = new Schema({

    userId: {
        type: String,
        required: [true, 'Id korisnika je obavezan prilikom zakazivanja. ']
    },

    date: {
        type: Date,
        required: [true, 'Datum je obavezan prilikom zakazivanja. ']
    },

}, { _id: false });



/* Subschema for real estate equipment (dictionary with concrete values) */
const realEstateEquipmentSubSchema = new Schema({
    internet: {//ide
        type: Boolean,
        default: false
    },

    katv: {//ide
        type: Boolean,
        default: false
    },

    phone: {//ide
        type: Boolean,
        default: false
    },

    airConditioner: { //ide
        type: Boolean,
        default: false
    },

    doubleBed: {
        type: Boolean,
        default: false
    },

    singleBed: {
        type: Boolean,
        default: false
    },

    fridge: {
        type: Boolean,
        default: false
    },

    freezer: {
        type: Boolean,
        default: false
    },

    fridgeFreezer: {
        type: Boolean,
        default: false
    },
    cooker: {
        type: Boolean,
        default: false
    },

    stove: {
        type: Boolean,
        default: false
    },

    washingMachine: {
        type: Boolean,
        default: false
    },

    shower: {
        type: Boolean,
        default: false
    },

    bathtub: {
        type: Boolean,
        default: false
    },

    dishwasher: {
        type: Boolean,
        default: false
    },

    tv: {
        type: Boolean,
        default: false
    },

    dryer: {
        type: Boolean,
        default: false
    },

    alarm: {
        type: Boolean,
        default: false
    },

}, { _id: false });


/* Subschema for building equipment (dictionary with concrete values) */
const buildingEquipmentSubSchema = new Schema({

    elevator: {//ide
        type: Boolean,
        default: false
    },

    interphone: {//ide
        type: Boolean,
        default: false
    },

    videoSurveillance: {//ide
        type: Boolean,
        default: false
    },

    security: {
        type: Boolean,
        default: false
    },

    wheelchairRamp: {
        type: Boolean,
        default: false
    },
}, { _id: false });


/* Mongoose shape and validation with schema for real estate */
let RealEstate = new Schema({

    users: {
        type: [String],
        default: []
    },
    mainPhotoId: {
        type: String
    },
    folderId: {
        type: String
    },

    /* Elementary informations */
    cooperation: {
        required: [true, 'Tip saradnje je obavezan. '],
        type: String,
        enum: { values: ['sale', 'rent'], message: 'Tip saradnje mora biti prodaja ili izdavanje. ' }
    },

    type: {
        required: [true, 'Tip nekretnine je obavezan. '],
        type: String,
        enum: { values: ['apartment', 'house'], message: 'Tip nekretnine mora biti kuca ili stan. ' }
    },

    _id: Number,

    city: {
        required: [true, 'Lokacija je obavezna. '],
        type: String,
        enum: {
            values: ['ns', 'bg'],
            message: 'Grad moze biti Beograd ili Novi Sad. '
        }
    },

    community: {
        type: String,
        required: [true, 'Opština je obavezna. '],
        text: true
    },

    street: {
        type: String,
        required: [true, 'Ulica je obavezna. '],
        text: true
    },

    price: {
        required: [true, 'Cena je obavezna. '],
        type: Number,
        min: [0, 'Cena mora biti pozitivna. ']
    },

    struct: {
        required: [true, 'Struktura nekretnine je obavezna. '],
        type: String,
        enum: {
            values: ['0-5', '1-0', '1-5', '2-0', '2-5', '3-0', '3-5', '4-0', '4-5'],
            message: 'Nekretnina moze biti jednosoban, jednoiposoban, dvosoban, dvoiposoban, trosoban, troiposoban, cetvorosoban ili veći stan ili garsonjera. '
        }
    },

    m2: {
        type: Number,
        required: [true, 'Povrsina je obavezna. '],
        min: [0, 'Povrsina mora biti pozitivna. ']
    },

    /* Additional informations */
    furnished: {
        type: String,
        required: [true, 'Opremljenost nekretnine je obavezno polje. '],
        enum: { values: ['furnished', 'unfurnished', 'halfFurnished'], message: 'Nekretnina moze biti namestena, polunamestena ili prazna. ' }
    },

    heating: {
        type: String,
        required: [true, 'Grejanje je obavezno polje. '],
        enum: {
            values: ['cg', 'eg', 'ta', 'gas', 'floatHeating', 'norwegianRadiators'],
            message: 'Grejanje moze biti CG, EG, TA, gas, podno ili Norveskim radijatorima. '
        }
    },

    floor: {
        type: Number,
        required: [true, 'Sprat je obavezan. '],
        min: [0, 'Sprat ne moze biti manji od 0. ']
    },

    totalNumberOfFloors: {
        type: Number,
        required: [true, 'Ukupan broj spratova na lokaciji gde se nekretnina nalazi je obavezan. '],
        //min: [this.floor, 'Ukupan broj spratova ne moze biti manji od sprata na kome se nalazi nekretnina. ']
        validate: [function (value) {
            return this.floor <= value;
        }, 'Ukupan broj spratova ne moze biti manji od sprata na kome se nalazi nekretnina. ']
    },

    yearOfBuilding: {
        type: Number,
        required: [true, 'Godina gradnje je obavezna. '],
        min: [1950, 'Godina gradnje ne moze biti manja od 1950. '],
        max: [new Date().getFullYear(), 'Godinja gradnje ne moze biti veca od trenutne godine. ']
    },


    renovation: {
        type: String,
        required: true,
        enum: {
            values: ['lux', 'newBuilding', 'renovated', 'oldBuilding', 'underConstruction'],
            message: 'Tip nekretnine moze biti lux, novogradnja, renovirana, starogradnja ili u izgradnji. '
        }
    },

    distanceFromCenterOfCity: {
        type: Number,
        required: [true, 'Udaljenost od centra grada je obavezna. '],
        min: [0, 'Udaljenost nekretnine od centra grada ne moze biti manja od 0. ']
    },

    description: {
        type: String,
        required: [true, 'Opis je obavezan. '],
    },

    deposit: {
        type: Number,
        required: [function () {
            return this.cooperation == "rent"
        }, 'Depozit je obavezan. '],
        min: [0, 'Depozit ne moze biti manji od 0. ']
    },

    minimumRentingPeriod: {
        type: Number,
        required: [function () {
            return this.cooperation == "rent"
        }, 'Najkraci period izdavanja je obavezno polje. '],
    },

    paymentPeriod: {
        type: String,
        required: [function () {
            return this.cooperation == "rent"
        }, 'Period placanja kirije je obavezan. '],
    },

    readyToMoveIn: {
        type: String,
        required: [function () {
            return this.cooperation == "rent"
        }, "Informacija o mogucem datumu useljenja je obavezno polje. "],
    },

    infostanCosts: {
        type: Number,
        required: [true, 'Infostan je obavezan. '],
        min: [0, 'Infostan ne moze biti manji od 0. ']
    },

    katvAndInternetCosts: {
        type: Number,
        default: -1
    },

    heatingCosts: {
        type: Number,
        required: [true, 'Cena grejanja je obavezna. '],
        min: [0, 'Cena grejanja ne moze biti manja od 0. ']
    },

    electricityCosts: {
        type: String,
        required: [function () {
            return this.cooperation == "rent"
        }, , 'Nacin placanja struje je obavezan. ']
    },

    propertyTaxCosts: {
        type: Number,
        default: -1
    },

    additionalSpace: {
        type: [String],
        default: []
    },

    parking: {
        type: [String],
        default: []
    },

    pets: {
        type: [String],
        default: []
    },

    realEstateEquipment: realEstateEquipmentSubSchema,

    buildingEquipment: buildingEquipmentSubSchema,

    appointments: {
        type: [appointmentSubSchema],
        default: []
    },

    monthlyExpenses: {
        type: Number,
        default: function () {
            return (isNaN(this.infostanCosts) ? 0 : this.infostanCosts) + (this.katvAndInternetCosts != -1 ? this.katvAndInternetCosts : 0) +
                (this.propertyTaxCosts != -1 ? this.propertyTaxCosts : 0) + (isNaN(this.heatingCosts) ? 0 : this.heatingCosts)
        }
    },
},
    { _id: false });

RealEstate.plugin(AutoIncrement);

RealEstate.index(
    {
        street: 'text',
    }
);


module.exports = mongoose.model("RealEstate", RealEstate);
