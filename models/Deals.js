const mongoose = require('mongoose');

// schema
const dealsSchema = mongoose.Schema({
    logo: String,
    link: String,
    category : {
        type: String,
        required: true
    },
    subcategory : {
        type: String,
        required: true
    },
    store: String,
    storeaddress: String,
    city: String,
    state: String,
    offer: {
        type: String,
        required: true
    },
    instruction: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: "rgb(100, 149, 237)"
    },
    display: Boolean,
    main: Boolean,
    created_by:String,
    create_date:{
        type: Date,
        default: Date.now
    }
});

const Deals = module.exports = mongoose.model('Deals', dealsSchema);

const deals = require('../data/deals.json');

// Get Deals
module.exports.getAllDeals = (callback, limit) => {
    return deals;
}

// Get main Deals
module.exports.getActiveDeals = (callback, limit) => {
    var myDeals = deals.filter(function(o){
        return (o.display === 1);
    });
    return myDeals;
}

// Get main Deals
module.exports.getMainDeals = (callback, limit) => {
    var myDeals = deals.filter(function(o){
        return (o.main === 1);
    });
    return myDeals;
}