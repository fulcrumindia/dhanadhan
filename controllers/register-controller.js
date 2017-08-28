var connection = require('./../config');
const session = require('express-session');
var sess;
var check = require('validator').check,sanitize = require('validator').sanitize;
const path = require('path');
const siteUrls = require('./../data/siteUrls.json');
const ErrorMessages = require('./../data/errorMessages.json');
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
                "email":req.body.eemail[0],
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

    req.checkBody("businessName", "Please enter business name");
    req.checkBody("name", "Please enter name");
    req.checkBody("email", "Please enter email").optional().isEmail().withMessage('Please enter valid email');
    req.checkBody("password", "Please enter password");
    req.checkBody("phone", "Please enter phone number").isLength({ min: 10,max:12 }).withMessage('Please enter valid mobile number').matches(/\d/);

    
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
            res.redirect(siteUrls.listbusiness);   
        }
    else
        {
            business.businessLogo=''; 
            if(files.businessLogo[0].size>0){
                var file_to_save='image_'+ randtoken.generate(16) + new Date().getFullYear() + '___profile.' + files.businessLogo[0].originalFilename;
                var oldpath = files.businessLogo[0].path;
                var newpath = 'C:/Users/lavysingh/Desktop/nodeimages/'+file_to_save;
                if (path.extname(files.businessLogo[0].path).toLowerCase() === '.png' || path.extname(files.businessLogo[0].path).toLowerCase() === '.jpg' || path.extname(files.businessLogo[0].path).toLowerCase() === '.jpeg' || path.extname(files.businessLogo[0].path).toLowerCase() === '.gif') {
                    fs.rename(oldpath, newpath, function(err) {
                        console.log("entered2");
                        if (err) {
                            business.businessLogo=oldpath;
                            console.log(err);
                            sess.error=ErrorMessages.imageUploadingError;
                            var result = {};           
                            Object.keys(users).forEach((key) => result[key] = users[key]);
                            Object.keys(business).forEach((key) => result[key] = business[key]);
                            
                            sess.formData=result;            
                            res.redirect(siteUrls.listbusiness);
                        }
                        else{
                            console.log("entered3");
                            business.businessLogo=file_to_save;                            
                            }    
                    });
                } else {
                    fs.unlink(newpath, function () {
                        
                            sess.error=ErrorMessages.imageExtError;
                            var result = {};           
                            Object.keys(users).forEach((key) => result[key] = users[key]);
                            Object.keys(business).forEach((key) => result[key] = business[key]);
                            
                            sess.formData=result;          
                            res.redirect(siteUrls.listbusiness);   
                        
                    });
                }     
            }

            // Save record 
            business.businessCategories=selectedCategories;
            connection.query('SELECT * FROM users WHERE phone = ?  OR (email = ? AND email!="") ',[req.body.phone[0],req.body.eemail[0]], function (error, results, fields) {
                if(results.length)
                    {
                        sess.error=ErrorMessages.emailPhoneExists;
                        var result = {};           
                        Object.keys(users).forEach((key) => result[key] = users[key]);
                        Object.keys(business).forEach((key) => result[key] = business[key]);
                        
                        sess.formData=result;          
                        res.redirect(siteUrls.listbusiness);   
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
                            res.redirect(siteUrls.listbusiness);   
                          }

                          connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
                          if (error) {
                            console.log(error);
                            sess.error=JSON.stringify(error.sqlMessage);
                            var result = {};           
                            Object.keys(users).forEach((key) => result[key] = users[key]);
                            Object.keys(business).forEach((key) => result[key] = business[key]);
                            
                            sess.formData=result;          
                            res.redirect(siteUrls.listbusiness);   
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
                                          res.redirect(siteUrlslistbusiness);  
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
                                                      res.redirect(siteUrls.listbusiness); 
                                                  });
                                                }
                                                sess.message=ErrorMessages.listbusinessAddedSuccess;
                                                res.redirect(siteUrls.listbusiness);  
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
    }
    else
    {
        res.redirect(siteUrls.sellerDeals);
    }
}