var connection = require('./../config');
const session = require('express-session');
var sess;
module.exports.register=function(req,res){
    sess=req.session;
    if(!sess.token){
    var today = new Date();
    var users={
        "username":req.body.username,
        "email":req.body.email,
        "password":req.body.password,
        "phone":req.body.phone,
        "user_role":2, 
        "alt_phone":req.body.alt_phone,
        "agreeTerms":req.body.agreeTerms,
        "name":req.body.name,
        "created_at":today,
        "updated_at":today
    }
    connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
      if (error) {
        console.log(error);
        sess.error=JSON.stringify(error.sqlMessage);
        res.redirect('/listbusiness');   
      }else{
            console.log(results);
            var business={
                        "businessName":req.body.businessName,
                        "businessTagLine":req.body.businessTagLine,
                        "businessAddress1":req.body.businessAddress1,
                        "businessAddress2":req.body.businessAddress2,
                        "businessCity":req.body.businessCity,
                        "businessState":req.body.businessState,
                        "businessHaveMultipleLocation":req.body.businessHaveMultipleLocation,
                        "businessNoOfLocations":req.body.businessNoOfLocations,
                        "businessLogo":req.body.businessLogo,
                        "businessCreatedBy":results.insertId
                    }
                connection.query('INSERT INTO business SET ?',business, function (error, results, fields) {
                  if (error) {
                    console.log(error);
                    sess.error=JSON.stringify(error.sqlMessage);
                  }else{
                        sess.message="You have successfully signed up.";                                           
                    }                
                res.redirect('/listbusiness');   
                });
            }
    });
    }
    else
    {
        res.redirect('deals');
    }
}