const mongoose = require('mongoose');

// schema
const specialOffersSchema = mongoose.Schema({
    image:{
        type: String,
        required: true
    },
    maintext: String,
    description : String,
    link: String,
    created_by:String,
    create_date:{
        type: Date,
        default: Date.now
    }
});

const SpecialOffers = module.exports = mongoose.model('SpecialOffers', specialOffersSchema);

const specialoffers = require('../data/specialoffers.json');

// Get SpecialOffers
module.exports.getSpecialOffers = (callback, limit) => {
    return specialoffers;
}