var connection = require('./../config');
const session = require('express-session');
var sess;
var check = require('validator').check,sanitize = require('validator').sanitize;
const path = require('path');
var fs = require('fs');
module.exports.register=function(req,res){
    sess=req.session;
    if(!sess.token){
    var today = new Date();
    console.log(req.body);        
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
            };
    if(typeof req.body.agreeTerms==undefined || req.body.agreeTerms==undefined || req.body.agreeTerms==null || req.body.agreeTerms=="undefined")
        {
            users.agreeTerms=0;
        }
    else
        users.agreeTerms=1;
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
                    
                };

    req.checkBody({
     'businessName': {
        optional: {
          options: { checkFalsy: true } // or: [{ checkFalsy: true }]
        },
        notEmpty: {
          errorMessage: 'Please enter business name'
        }
      },
      'name': { //
        optional: true, // won't validate if field is empty
        isLength: {
          options: [{ max: 50 }],
          errorMessage: 'Name must be less than 50 chars long' // Error message for the validator, takes precedent over parameter message
        },
        notEmpty: true,
        errorMessage: 'Name can not be blank'         
      },
      'email': {
        optional: {
          options: { checkFalsy: true } // or: [{ checkFalsy: true }]
        },
        isEmail: {
          errorMessage: 'Please enter valid email'
        }
      },
      'password': {
        notEmpty: true,
        errorMessage: 'Password can not be blank' // Error message for the parameter
      },
      'phone': { //
        optional: true, // won't validate if field is empty
        notEmpty: true,
        errorMessage: 'Phone can not be blank' ,
        isInt:{
            errorMessage: 'Phone must be integer' 
        },
        isLength: {
          options: [{ min: 10, max: 12 }],
          errorMessage: 'Phone must be between 10 and 12 chars long' // Error message for the validator, takes precedent over parameter message
        },
        
      }
    });
    
    //Run the validators
    var errors = req.validationErrors();
    if(errors)
        {
            sess.error=errors;
            var result = {};           
            Object.keys(users).forEach((key) => result[key] = users[key]);
            Object.keys(business).forEach((key) => result[key] = business[key]);
            
            sess.formData=result;            
            res.redirect('/listbusiness');   
        }
    else
        {
            /*var tempPath = req.body.businessLogo.path,targetPath = path.resolve('./uploads/image.png');
            if (path.extname(req.body.businessLogo.name).toLowerCase() === '.png' || path.extname(req.body.businessLogo.name).toLowerCase() === '.jpg' || path.extname(req.body.businessLogo.name).toLowerCase() === '.jpeg' || path.extname(req.body.businessLogo.name).toLowerCase() === '.gif') {
                fs.rename(tempPath, targetPath, function(err) {
                    if (err) {
                        sess.error=JSON.stringify(err);
                        var result = {};           
                        Object.keys(users).forEach((key) => result[key] = users[key]);
                        Object.keys(business).forEach((key) => result[key] = business[key]);
                        
                        sess.formData=result;            
                        res.redirect('/listbusiness');
                    }
                    else{*/
                    connection.query('SELECT * FROM users WHERE username = ? OR phone = ?  OR email = ? ',[req.body.username,req.body.home,req.body.email], function (error, results, fields) {
                            if(results.length)
                                {
                                    sess.error="Email or Phone or username number already exists";
                                    var result = {};           
                                    Object.keys(users).forEach((key) => result[key] = users[key]);
                                    Object.keys(business).forEach((key) => result[key] = business[key]);
                                    
                                    sess.formData=result;          
                                    res.redirect('/listbusiness');   
                                }
                            else
                                {
                                    connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
                                      if (error) {
                                        console.log(error);
                                        sess.error=JSON.stringify(error.sqlMessage);
                                        var result = {};           
                                        Object.keys(users).forEach((key) => result[key] = users[key]);
                                        Object.keys(business).forEach((key) => result[key] = business[key]);
                                        
                                        sess.formData=result;          
                                        res.redirect('/listbusiness');   
                                      }else{
                                            console.log(results);
                                            business.businessCreatedBy=results.insertId;
                                                connection.query('INSERT INTO business SET ?',business, function (error, results, fields) {
                                                  if (error) {
                                                    console.log(error);
                                                    sess.error=errors;
                                                    var result = {};           
                                                    Object.keys(users).forEach((key) => result[key] = users[key]);
                                                    Object.keys(business).forEach((key) => result[key] = business[key]);
                                                    
                                                    sess.formData=result;
                                                    res.redirect('/listbusiness');   
                                                  }else{
                                                        sess.message="You have successfully signed up.";                                           
                                                    }                
                                                res.redirect('/listbusiness');   
                                                });
                                            }
                                    });
                                }

                       });       
                    /*}    
                });
            } else {
                fs.unlink(tempPath, function () {
                    if (err) 
                    {
                         sess.error="Only png,jpg,jpeg and gif images are allowed";
                        var result = {};           
                        Object.keys(users).forEach((key) => result[key] = users[key]);
                        Object.keys(business).forEach((key) => result[key] = business[key]);
                        
                        sess.formData=result;          
                        res.redirect('/listbusiness');   
                    }
                });
            }       */      
        }           
        
    }
    else
    {
        res.redirect('deals');
    }
}