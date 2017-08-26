var connection = require('./../config');
const session = require('express-session');
var sess;
const labels = require('./../data/labels.json');
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
                "dealLink":req.body.link,
                "dealCategory":req.body.category,
                "dealSubcategory":req.body.subcategory,
                "dealStore":req.body.store,
                "dealStoreaddress":req.body.storeaddress,
                "dealCity":req.body.city,
                "dealState":req.body.state,
                "dealOffer":req.body.offer,
                "dealInstructions":req.body.instruction,
                "dealColor":req.body.color,
                "dealDisplay":req.body.display,
                "dealMain":req.body.main,
                "dealCreatedBy":sess.userId,
                "dealCreatedDate":today                
            }
        connection.query('INSERT INTO deals SET ?',deals, function (error, results, fields) {
          if (error) {
            res.json({
                status:false,
                message:error
            })
          }else{
                  res.json({
                status:true,
                data:results,
                message:'Deal created sucessfully'
                });                        
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
    if(sess.token && sess.userRole==2){
         connection.query('SELECT * FROM deals WHERE dealCreatedBy = ?',[sess.userId], function (error, results, fields) {
          if (error) {
              res.render('./deals',{error:error});
          }else{
            console.log(results);
            res.render('./deals',{results:results,layout:'seller',label:labels});
          }
        });
    }
    else
        {
            res.redirect('/login');
        }
}