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

// models
const Banners = require('./models/Banners');
const SpecialOffers = require('./models/SpecialOffers');

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
        specialoffers: SpecialOffers.getSpecialOffers()
    }
    res.render('index',view);
});

// start server
app.listen(port, () => {
    console.log('Server running on port :'+port);
});