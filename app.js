const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const hbs = require('express-handlebars');
var fs = require('fs');
const app = express();
const port = process.env.port || 8080;

// custom config
const config = require('./config/database');

// default data
const labels = require('./data/labels.json');
const listBusiness = require('./data/listbusiness.json');
const categories = require('./data/categories.json');

// models
const Banners = require('./models/Banners');
const SpecialOffers = require('./models/SpecialOffers');
const Deals = require('./models/Deals');

// routes
const api = require('./routes/api');

// handlebars config
var viewsPath = path.join(__dirname,'views');
app.set('views',viewsPath);
app.engine('hbs', hbs({extname: 'hbs', defaultLayout:'layout', layoutsDir: viewsPath+'/layouts', partialsDir: viewsPath+'/partials' }));
app.set('view engine','hbs');

// connect to mongoose db
mongoose.connect(config.database);

// on connection
mongoose.connection.on('connected',() => {
    console.log('Connected to database '+config.database);
});

// on error
mongoose.connection.on('error',(err) => {
    console.log('Database Error '+err);
});

// cors middleware
app.use(cors());

// body parse middleware
app.use(bodyParser.json());

// routes
app.use('/api',api);

// static path
app.use(express.static(path.join(__dirname, 'public')));

// index route
app.get('/',(req,res)=>{
    var view = {
        label:labels,
        banners: Banners.getBanners(),
        specialoffers: SpecialOffers.getSpecialOffers(),
        deals: Deals.getMainDeals()
    }
    res.render('index',view);
});

// contact route
app.get('/contact',(req,res)=>{
    var view = {
        label:labels
    }
    res.render('contact',view);
});

// login route
app.get('/login',(req,res)=>{
    var view = {
        label:labels
    }
    res.render('login',view);
});

// signup route
app.get('/signup',(req,res)=>{
    var view = {
        label:labels
    }
    res.render('signup',view);
});

// listbusiness route
app.get('/listbusiness',(req,res)=>{
    var view = {
        label:labels,
        wizarddata: listBusiness,
        categories: categories,
        helpers: {
            switch: function (value, options) { 
                this._switch_value_ = value;
                var html = options.fn(this); // Process the body of the switch block
                delete this._switch_value_;
                return html;
            },
            case: function (value, options) { 
                var args = Array.prototype.slice.call(arguments);
                var options    = args.pop();
                var caseValues = args;

                if (this._switch_break_ || caseValues.indexOf(this._switch_value_) === -1) {
                    return '';
                } else {
                    if (options.hash.break === true) {
                        this._switch_break_ = true;
                    }
                    return options.fn(this);
                }
            },
            default: function(options) {
                if (!this._switch_break_) {
                    return options.fn(this);
                }
            }
        }
    }
    res.render('listbusiness',view);
});

// start server
app.listen(port, () => {
    console.log('Server running on port :'+port);
});