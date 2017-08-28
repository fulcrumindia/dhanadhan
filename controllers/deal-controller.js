var connection = require('./../config');
const session = require('express-session');
var sess;
const labels = require('./../data/labels.json');
const adddeals = require('./../data/deals.json');
const categories = require('./../data/categories.json');

var check = require('validator').check,sanitize = require('validator').sanitize;
var multiparty = require('multiparty');
/*
Sample Request :
{
    "link":"http://www.spencers.com",
    "category":3,
    "subcategory":"clothing",
    "store":"Spencers",
    "storeaddress":"pentagon mall",
    "city":"Haridwar",
    "state":"UK",
    "offer":"offers",
    "instruction":"instructins",
    "color":"red",
    "display":1,
    "main":0
}
*/
module.exports.createDeal=function(req,res){    
    sess=req.session;
    if(sess.token && sess.userRole==2){
         var today = new Date();
            var deals={
                "dealLink":req.body.dealLink,
                "dealCategory":req.body.dealCategory,
                "dealSubcategory":req.body.dealSubcategory,
                "dealStore":req.body.dealStore,
                "dealStoreaddress":req.body.dealStoreAddress,
                "dealCity":req.body.dealCity,
                "dealState":req.body.dealState,
                "dealOffer":req.body.dealOffer,
                "dealInstructions":req.body.dealInstructions,
                "dealDisclaimer":req.body.dealDisclaimer,
                "dealColor":req.body.dealColor,
                "dealCreatedBy":sess.userId,
                "dealCreatedDate":today                
            };

            if(typeof req.body.dealMain==undefined || req.body.dealMain==undefined || req.body.dealMain==null || req.body.dealMain=="undefined")
                {
                    deals.dealMain=0;
                }
            else
                deals.dealMain=1;

            if(typeof req.body.dealDisplay==undefined || req.body.dealDisplay==undefined || req.body.dealDisplay==null || req.body.dealDisplay=="undefined")
                {
                    deals.dealDisplay=0;
                }
            else
                deals.dealDisplay=1;

            connection.query('INSERT INTO deals SET ?',deals, function (error, results, fields) {
              if (error) {
                sess.error=error;                
                sess.formData=deals;            
                res.redirect('/adddeal');   
              }else{
                    sess.error=''; 
                    sess.message="Deal successfully added.";                
                    res.redirect('/adddeal');                               
                }            
            });
         
    }
    else
        {
            res.redirect('/login');
        }
}

module.exports.dealsList=function(req,res){    
    sess=req.session;
    sess.error='';
    sess.message='';
    if(sess.token && sess.userRole==2){
         connection.query('SELECT * FROM deals WHERE dealCreatedBy = ?',[sess.userId], function (error, results, fields) {
          if (error) {
              res.render('./deals',{error:error,newdealpagelink:'adddeal',title:'Deals'});
          }else{
            console.log(results);
            res.render('./deals',{results:results,layout:'seller',label:labels,newdealpagelink:'adddeal',title:'Deals'});
          }
        });
    }
    else
        {
            res.redirect('/login');
        }
}

module.exports.updatedeal=function (req,res){
    sess=req.session;
    if(sess.token && sess.userRole==2){

        connection.query('SELECT * FROM deals WHERE dealId= ? AND dealCreatedBy= ?',[req.query.dealid,sess.userId], function (error, results, fields) {
              if (error) {
                sess.error=error;                
                sess.formData=results;            
                res.redirect('/deals');   
              }else{
                if (!results.length) {
                    sess.error='';                
                    sess.formData='';            
                    res.redirect('/deals');   
                  }
                  else{
                    sess.formData=results[0];  
                    adddeals.header="Update Deal";
                    var view = {
                    wizarddata: adddeals,
                    categories: categories,
                    adddeal:"updatedeal",
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
                        checkbox:function (v1,  v2, options) {                
                                    if (v1[v2] == 1)
                                        return ' checked="1"';
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
                }      
            });

        
    }
    else
    {
        res.redirect('deals');
    }
}

module.exports.updateDealData=function(req,res){    
    sess=req.session;
    if(sess.token && sess.userRole==2){
         var today = new Date();
            var deals={
                 "dealLink":req.body.dealLink,
                "dealCategory":req.body.dealCategory,
                "dealSubcategory":req.body.dealSubcategory,
                "dealStore":req.body.dealStore,
                "dealStoreaddress":req.body.dealStoreAddress,
                "dealCity":req.body.dealCity,
                "dealState":req.body.dealState,
                "dealOffer":req.body.dealOffer,
                "dealInstructions":req.body.dealInstructions,
                "dealColor":req.body.dealColor,
                "dealCreatedDate":today,
                "dealDisclaimer":req.body.dealDisclaimer
                                
            };

            if(typeof req.body.dealMain==undefined || req.body.dealMain==undefined || req.body.dealMain==null || req.body.dealMain=="undefined")
                {
                    deals.dealMain=0;
                }
            else
                deals.dealMain=1;

            if(typeof req.body.dealDisplay==undefined || req.body.dealDisplay==undefined || req.body.dealDisplay==null || req.body.dealDisplay=="undefined")
                {
                    deals.dealDisplay=0;
                }
            else
                deals.dealDisplay=1;

            connection.query('UPDATE deals SET ? WHERE dealId='+req.body.dealId+' AND dealCreatedBy='+sess.userId,[deals], function (error, results, fields) {
              if (error) {
                console.log(error);
                sess.error=error;                
                sess.formData=results;            
                res.redirect('/deals');   
              }else{
                    sess.error=''; 
                    sess.message="Deal successfully updated.";                
                    res.redirect('/updatedeal?dealid='+req.body.dealId);                              
                }            
            });
         
    }
    else
        {
            res.redirect('/login');
        }
}


module.exports.deletedeal=function(req,res){    
    sess=req.session;
    if(sess.token && sess.userRole==2){        
           
            connection.query('DELETE FROM deals WHERE dealId='+req.query.dealid+' AND dealCreatedBy='+sess.userId,[], function (error, results, fields) {
              if (error) {
                console.log(error);
                sess.error=error;                
                res.redirect('/deals');   
              }else{
                    sess.error=''; 
                    sess.message="Deal successfully deleted.";                
                    res.redirect('/deals');                              
                }            
            });
         
    }
    else
        {
            res.redirect('/login');
        }
}
