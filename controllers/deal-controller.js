var connection = require('./../config');
const session = require('express-session');
var sess;
const labels = require('./../data/labels.json');
const adddeals = require('./../data/dealsform.json');
const categories = require('./../data/categories.json');
const siteUrls = require('./../data/siteUrls.json');
const ErrorMessages = require('./../data/errorMessages.json');

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
                //"dealStore":req.body.dealStore,
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
                sess.error=ErrorMessages.addDealError;                
                sess.formData=deals;            
                res.redirect(siteUrls.sellerAddDeal);   
              }else{
                    sess.error=''; 
                    sess.message=ErrorMessages.addDealSuccess;                
                    res.redirect(siteUrls.sellerDeals);                               
                }            
            });
         
    }
    else
        {
            res.redirect(siteUrls.login);
        }
}

module.exports.dealsList=function(req,res){    
    sess=req.session;
    
    if(sess.token && sess.userRole==2){
         connection.query('SELECT * FROM deals WHERE dealCreatedBy = ?',[sess.userId], function (error, results, fields) {
          if (error) {
              res.render('./deals',{error:error,newdealpagelink:siteUrls.sellerAddDeal,updatedeal:siteUrls.sellerUpdateDeal,title:'Deals',flasherror:sess.error,flashmessage:sess.message});
          }else{
            console.log(results);
            res.render('./deals',{results:results,layout:'seller',label:labels,newdealpagelink:siteUrls.sellerAddDeal,updatedeal:siteUrls.sellerUpdateDeal,title:'Deals',flasherror:sess.error,flashmessage:sess.message});
            
          }
          sess.error='';
            sess.message='';
        });
         
    }
    else
        {
            res.redirect(siteUrls.login);
        }
}

module.exports.updatedeal=function (req,res){
    sess=req.session;
    if(sess.token && sess.userRole==2){

        connection.query('SELECT * FROM deals WHERE dealId= ? AND dealCreatedBy= ?',[req.query.dealid,sess.userId], function (error, results, fields) {
              if (error) {
                sess.error=error;                
                sess.formData=results;            
                res.redirect(siteUrls.sellerDeals);   
              }else{
                if (!results.length) {
                    sess.error='';                
                    sess.formData='';            
                    res.redirect(siteUrls.sellerDeals);   
                  }
                  else{
                    sess.formData=results[0];  
                    adddeals.header="Update Deal";
                    var view = {
                    wizarddata: adddeals,
                    categories: categories,
                    adddeal:siteUrls.sellerUpdateDeal,
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
        res.redirect(siteUrls.sellerDeals);
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
                //"dealStore":req.body.dealStore,
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
                sess.error=ErrorMessages.updateDealError;                
                sess.formData=results;            
                res.redirect(siteUrls.sellerDeals);   
              }else{
                    sess.error=''; 
                    sess.message=ErrorMessages.updateDealSuccess;                
                    res.redirect(siteUrls.sellerDeals);                              
                }            
            });
         
    }
    else
        {
            res.redirect(siteUrls.login);
        }
}


module.exports.deletedeal=function(req,res){    
    sess=req.session;
    if(sess.token && sess.userRole==2){        
           
            connection.query('DELETE FROM deals WHERE dealId='+req.query.dealid+' AND dealCreatedBy='+sess.userId,[], function (error, results, fields) {
              if (error) {
                console.log(error);
                sess.error=ErrorMessages.deleteDealError;                
                res.redirect(siteUrls.sellerDeals);   
              }else{
                    sess.error=''; 
                    sess.message=ErrorMessages.deleteDealSuccess;                
                    res.redirect(siteUrls.sellerDeals);                              
                }            
            });
         
    }
    else
        {
            res.redirect(siteUrls.login);
        }
}
