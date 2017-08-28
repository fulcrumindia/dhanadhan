const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const hbs = require('express-handlebars');
var fs = require('fs');
const app = express();
const port = process.env.port || 3000;
const session = require('express-session');
const expressValidator = require('express-validator');
// custom config
//const config = require('./config/database');

// body parse middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser({uploadDir:'/profileImages'}));
app.use(expressValidator()); // Add this after the bodyParser middlewares!
app.use(session({secret: 'Lbim2201'}));
var sess;


var authenticateController=require('./controllers/authenticate-controller');
var registerController=require('./controllers/register-controller');
var dealController=require('./controllers/deal-controller');

// default data
const labels = require('./data/labels.json');
const listBusiness = require('./data/listbusiness.json');
const adddeals = require('./data/dealsform.json');
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

// cors middleware
app.use(cors());

// routes
app.use('/api',api);
/* route to handle login and registration */
app.post('/listbusiness',registerController.register); // Create Seller and Business 
app.post('/adddeal',dealController.createDeal); // Create Deal
app.post('/updatedeal',dealController.updateDealData); // Update Deal
app.get('/deletedeal',dealController.deletedeal); // Delete Deal

app.post('/login',authenticateController.authenticate);
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
    sess=req.session;
    if(sess.token) {
        /*
        * This line check Session existence.
        * If it existed will do some action.
        */
            res.redirect('/deals');
        }
        else {
            var view = {
                    label:labels,
                    formSubmitUrl:'login',
                    signupUrl:'listbusiness'
                    }
            if(sess.error)
                {
                    view.error=sess.error;
                    sess.error='';
                }
            
                res.render('login',view);
            }
    
});

// logout route
app.get('/logout',(req,res)=>{
    sess=req.session;    
    sess.token='';
    sess.userId='';
    sess.userRole='';
    res.redirect('/login');           

});


// deals route
app.get('/deals',dealController.dealsList);

// signup route
app.get('/signup',(req,res)=>{
    var view = {
        label:labels
    }
    res.render('signup',view);
});

// listbusiness route
app.get('/listbusiness',(req,res)=>{
    sess=req.session;
    if(!sess.token){
        console.log(sess.message);
        console.log("sess.selectedCategories" + sess.selectedCategories);
        if(typeof sess.selectedCategories=='string' && sess.selectedCategories!=undefined && sess.selectedCategories!='')
            sess.selectedCategories = sess.selectedCategories.split(',');
        else
            sess.selectedCategories = "";
        console.log(sess.selectedCategories);
        var view = {
        label:labels,
        flashmessage:sess.message,
        flasherror:sess.error,
        frmdata:sess.formData,
        selectedCategories:sess.selectedCategories,
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
            },
            equal:function (v1,  v2, msg, options) {
                
                        if (v1 == v2)
                            return '<h6 class="text-danger">'+msg+'</h6>';
                        else
                            return '';
                    
                },
            equalality:function (v1,  v2, options) {                
                        if (v1 == v2)
                            return 'active';
                        else
                            return '';
                    
                },
            checktype:function (v1,  v2, options) {                
                         if(typeof v1!=undefined && v1!=undefined)
                            {
                                if (typeof v1 == 'object')
                                    return "<h6 class='text-danger'>Validation error occurred</h6>";
                                else
                                    return "<h6 class='text-danger'>"+v1+"</h6>";
                            }
                          else
                            return '';  
                    
                }
            
        }

        
    }
    console.log(sess.error);               

    sess.message='';
    sess.error='';
    sess.formData='';
    sess.selectedCategories = "";
    res.render('listbusiness',view);
    }
    else
    {
        res.redirect('deals');
    }
});

app.get('/updatedeal',dealController.updatedeal);

// adddeals route
app.get('/adddeal',(req,res)=>{
    adddeals.header="Add Deal";
    sess=req.session;
    if(sess.token && sess.userRole==2){
        var view = {
        wizarddata: adddeals,
        categories: categories,
        adddeal:"adddeal",
        frmdata:sess.formData,
        flasherror:sess.error,
        flashmessage:sess.message,
        label:labels,
        layout:'seller',
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
            },
            equal:function (v1,  v2, msg, options) {
                
                        if (v1 == v2)
                            return '<h6 class="text-danger">'+msg+'</h6>';
                        else
                            return '';
                    
                },
            equalality:function (v1,  v2, options) {                
                        if (v1 == v2)
                            return 'active';
                        else
                            return '';
                    
                },
            
           checkbox:function (v1,  v2, options) {                
                                    if (v1[v2] == 1)
                                        return ' checked="1"';
                                    else
                                        return '';
                                
                            },
            checktype:function (v1,  v2, options) {                
                         if(typeof v1!=undefined && v1!=undefined)
                            {
                                if (typeof v1 == 'object')
                                    return "<h6 class='text-danger'>Validation error occurred</h6>";
                                else
                                    return "<h6 class='text-danger'>"+v1+"</h6>";
                            }
                          else
                            return '';  
                    
                },
            selectedoption:function(frm,  key, value, options)
                {
                    if(frm[key]==value)
                        return ' selected="selected" ';
                }
            
        }

        
    }
    sess.error='';
    sess.message='';
    sess.formData='';
    res.render('adddeal',view);
    }
    else
    {
        res.redirect('login');
    }
});

// start server
app.listen(port, () => {
    console.log('Server running on port :'+port);
});