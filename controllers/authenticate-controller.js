var connection = require('./../config');
const session = require('express-session');
const siteUrls = require('./../data/siteUrls.json');
const ErrorMessages = require('./../data/errorMessages.json');
var randtoken = require('rand-token');
var sess;
module.exports.authenticate=function(req,res){
  sess=req.session;
  if(!sess.token){
    var phone=req.body.phone;
    var password=req.body.password;
    connection.query('SELECT * FROM users WHERE phone = ?',[phone], function (error, results, fields) {
      if (error) {
        console.log(error);
          sess.error=ErrorMessages.InternalServerError;
          res.redirect(siteUrls.login);
      }else{
        if(results.length >0){
            if(password==results[0].password){
              //Setting the session variables
              sess.userId=results[0].id;
              sess.userRole=results[0].user_role;
              sess.token=randtoken.generate(16);
              res.redirect(siteUrls.sellerDeals);
            }else{
                sess.error=ErrorMessages.authenticationError;
                res.redirect(siteUrls.login);
            }
         
        }
        else{
          sess.error=ErrorMessages.loginPhoneNotExists;
          res.redirect(siteUrls.login);
        }
      }
    });
  }
  else
  {
    res.redirect(siteUrls.sellerDeals);
  }
}