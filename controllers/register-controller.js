var connection = require('./../config');
const session = require('express-session');
var sess;
var check = require('validator').check,sanitize = require('validator').sanitize;
const path = require('path');
var fs = require('fs');
var http = require('http');
var multiparty = require('multiparty');
var randtoken = require('rand-token');
module.exports.register=function(req,res){
    sess=req.session;
    if(!sess.token){
    var today = new Date();
    //console.log(new multiparty.Form()); 
    //console.log(req);      
    (new multiparty.Form()).parse(req, function (err, fields, files) {     
        console.log(fields);
        console.log(files);
        req.body=fields;
    var users={
                "email":req.body.email[0],
                "password":req.body.password[0],
                "phone":req.body.phone[0],
                "user_role":2, 
                "alt_phone":req.body.alt_phone[0],
                "name":req.body.name[0],
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
                    "businessName":req.body.businessName[0],
                    "businessTagLine":req.body.businessTagLine[0],
                    "businessAddress1":req.body.businessAddress1[0],
                    "businessAddress2":req.body.businessAddress2[0],
                    "businessCity":req.body.businessCity[0],
                    "businessState":req.body.businessState[0],
                    "businessHaveMultipleLocation":req.body.businessHaveMultipleLocation[0],
                    "businessNoOfLocations":req.body.businessNoOfLocations[0],                   
                };
    if(typeof req.body.selectedCategories==undefined || req.body.selectedCategories==undefined || req.body.selectedCategories==null || req.body.selectedCategories=='undefined')
        {
            var selectedCategories='';
        }
    else
        var selectedCategories=req.body.selectedCategories[0];
    console.log(selectedCategories);
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
    sess.selectedCategories=selectedCategories;
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
             console.log("entered1");
             var file_to_save='image_'+ randtoken.generate(16) + new Date().getFullYear() + '___profile.' + files.businessLogo[0].originalFilename;
            var oldpath = files.businessLogo[0].path;
            var newpath = 'C:/Users/user/Desktop/nodeimages/'+file_to_save;
            if (path.extname(files.businessLogo[0].path).toLowerCase() === '.png' || path.extname(files.businessLogo[0].path).toLowerCase() === '.jpg' || path.extname(files.businessLogo[0].path).toLowerCase() === '.jpeg' || path.extname(files.businessLogo[0].path).toLowerCase() === '.gif') {
                fs.rename(oldpath, newpath, function(err) {
                    console.log("entered2");
                    if (err) {
                        business.businessLogo=oldpath;
                        console.log(err);
                        sess.error="Error in image uploading";
                        var result = {};           
                        Object.keys(users).forEach((key) => result[key] = users[key]);
                        Object.keys(business).forEach((key) => result[key] = business[key]);
                        
                        sess.formData=result;            
                        res.redirect('/listbusiness');
                    }
                    else{
                         console.log("entered3");
                        business.businessLogo=file_to_save;
                        business.businessCategories=selectedCategories;
                        connection.query('SELECT * FROM users WHERE phone = ?  OR (email = ? AND email!="") ',[req.body.phone[0],req.body.email[0]], function (error, results, fields) {
                            if(results.length)
                                {
                                    sess.error="Email or Phone number already exists";
                                    var result = {};           
                                    Object.keys(users).forEach((key) => result[key] = users[key]);
                                    Object.keys(business).forEach((key) => result[key] = business[key]);
                                    
                                    sess.formData=result;          
                                    res.redirect('/listbusiness');   
                                }
                            else
                                {
                                    connection.beginTransaction(function(err) {
                                      if (err) { 
                                        console.log(err);
                                        sess.error=JSON.stringify(err);
                                        var result = {};           
                                        Object.keys(users).forEach((key) => result[key] = users[key]);
                                        Object.keys(business).forEach((key) => result[key] = business[key]);
                                        
                                        sess.formData=result;          
                                        res.redirect('/listbusiness');   
                                      }

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
                                                      connection.rollback(function() {
                                                      console.log(error);
                                                      sess.error=errors;
                                                      var result = {};           
                                                      Object.keys(users).forEach((key) => result[key] = users[key]);
                                                      Object.keys(business).forEach((key) => result[key] = business[key]);
                                                      
                                                      sess.formData=result;
                                                      res.redirect('/listbusiness');  
                                                    });
                                                     
                                                  }else{
                                                        
                                                        connection.commit(function(err) {
                                                            if (err) {
                                                              return connection.rollback(function() {
                                                                  console.log(err);
                                                                  sess.error=JSON.stringify(err);
                                                                  var result = {};           
                                                                  Object.keys(users).forEach((key) => result[key] = users[key]);
                                                                  Object.keys(business).forEach((key) => result[key] = business[key]);
                                                                  
                                                                  sess.formData=result;
                                                                  res.redirect('/listbusiness'); 
                                                              });
                                                            }
                                                            sess.message="You have successfully signed up.";
                                                            res.redirect('/listbusiness');  
                                                          });                                               
                                                    }                
                                                 
                                                });
                                            }
                                      });
                                    });
                                }

                       });       
                    }    
                });            
            } else {
                fs.unlink(newpath, function () {
                    
                         sess.error="Only .png,.jpg,.jpeg and .gif images are allowed";
                        var result = {};           
                        Object.keys(users).forEach((key) => result[key] = users[key]);
                        Object.keys(business).forEach((key) => result[key] = business[key]);
                        
                        sess.formData=result;          
                        res.redirect('/listbusiness');   
                    
                });
            }       
        }           
     });    
    }
    else
    {
        res.redirect('deals');
    }
}