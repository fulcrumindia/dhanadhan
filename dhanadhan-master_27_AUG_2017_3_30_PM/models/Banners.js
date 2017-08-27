const mongoose = require('mongoose');

// schema
const bannerSchema = mongoose.Schema({
    image:{
        type: String,
        required: true
    },
    maintext: String,
    link: String,
    description : String,
    alignment: {
        type: String,
        default: 'right'
    },
    created_by:String,
    create_date:{
        type: Date,
        default: Date.now
    }
});

const Banners = module.exports = mongoose.model('Banners', bannerSchema);

const banners = require('../data/banners.json');

// Get Banners
module.exports.getBanners = (callback, limit) => {
    return banners;
}