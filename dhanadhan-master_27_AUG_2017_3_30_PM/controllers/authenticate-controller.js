var connection = require('./../config');
const session = require('express-session');

var randtoken = require('rand-token');
var sess;
module.exports.authenticate=function(req,res){
  sess=req.session;
  if(!sess.token){
    var phone=req.body.phone;
    var password=req.body.password;
    connection.query('SELECT * FROM users WHERE phone = ?',[phone], function (error, results, fields) {
      if (error) {
          sess.error="Internal server error.";
          res.redirect('/login');
      }else{
        if(results.length >0){
            if(password==results[0].password){
              //Setting the session variables
              sess.userId=results[0].id;
              sess.userRole=results[0].user_role;
              sess.token=randtoken.generate(16);
              res.redirect('/deals');
            }else{
                sess.error="Phone and password does not match";
                res.redirect('/login');
            }
         
        }
        else{
          sess.error="Phone does not exists"
          res.redirect('/login');
        }
      }
    });
  }
  else
  {
    res.redirect('/deals');
  }
}