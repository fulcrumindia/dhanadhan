var connection = require('./../config');
const session = require('express-session');
var sess;
const labels = require('./../data/labels.json');
const addproducts = require('./../data/productform.json');
const categories = require('./../data/categories.json');
const siteUrls = require('./../data/siteUrls.json');
const ErrorMessages = require('./../data/errorMessages.json');
const path = require('path');
var check = require('validator').check,sanitize = require('validator').sanitize;
var fs = require('fs');
var http = require('http');
var multiparty = require('multiparty');
var randtoken = require('rand-token');
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
module.exports.createProduct=function(req,res){    
    sess=req.session;
    if(sess.token && sess.userRole==2){
        (new multiparty.Form()).parse(req, function (err, fields, files) {     
           req.body=fields;
         var today = new Date();
            var products={
                "productName":req.body.productName[0],
                "productCategory":req.body.productCategory[0],
                "productSubcategory":req.body.productSubcategory[0],
                "productSku":req.body.productSku[0],
                "productPrice":req.body.productPrice,
                "productSellingPrice":req.body.productSellingPrice[0],
                "productSalePrice":req.body.productSalePrice[0],
                "productDescription":req.body.productDescription[0],                
                "productCreatedBy":sess.userId                             
            };

            if(typeof req.body.productMain==undefined || req.body.productMain==undefined || req.body.productMain==null || req.body.productMain=="undefined")
                {
                    products.productMain=0;
                }
            else
                products.productMain=1;

            if(typeof req.body.productDisplay==undefined || req.body.productDisplay==undefined || req.body.productDisplay==null || req.body.productDisplay=="undefined")
                {
                    products.productDisplay=0;
                }
            else
                products.productDisplay=1;

            products.productImage=''; 
            if(files.productImage[0].size>0){
                var file_to_save='image_'+ randtoken.generate(16) + new Date().getFullYear() + '___profile.' + files.productImage[0].originalFilename;
                var oldpath = files.productImage[0].path;
                var newpath = 'C:/Users/user/Desktop/productimages/'+file_to_save;
                if (path.extname(files.productImage[0].path).toLowerCase() === '.png' || path.extname(files.productImage[0].path).toLowerCase() === '.jpg' || path.extname(files.businessLogo[0].path).toLowerCase() === '.jpeg' || path.extname(files.businessLogo[0].path).toLowerCase() === '.gif') {
                    fs.rename(oldpath, newpath, function(err) {
                        console.log("entered2");
                        if (err) {
                            product.productImage=oldpath;
                            console.log(err);
                            sess.error=ErrorMessages.imageUploadingError;                            
                            sess.formData=products;            
                            res.redirect(siteUrls.sellerAddProduct);
                        }
                        else{
                            console.log("entered3");
                            products.productImage=file_to_save;  
                             connection.query('INSERT INTO products SET ?',products, function (error, results, fields) {
                              if (error) {
                                console.log("Product add error : ");
                                console.log(error);
                                sess.error=ErrorMessages.addProductError;                
                                sess.formData=products;            
                                res.redirect(siteUrls.sellerAddProduct);   
                              }else{
                                    sess.error=''; 
                                    sess.message=ErrorMessages.addProductSuccess;                
                                    res.redirect(siteUrls.sellerProducts);                               
                                }            
                            });                          
                            }    
                    });
                } else {
                    fs.unlink(newpath, function () {
                            sess.error=ErrorMessages.imageExtError;                            
                            sess.formData=products;          
                            res.redirect(siteUrls.listbusiness);   
                        
                    });
                }     
            }
            else{
            
                connection.query('INSERT INTO products SET ?',products, function (error, results, fields) {
                  if (error) {
                    console.log("Product add error : ");
                    console.log(error);
                    sess.error=ErrorMessages.addProductError;                
                    sess.formData=products;            
                    res.redirect(siteUrls.sellerAddProduct);   
                  }else{
                        sess.error=''; 
                        sess.message=ErrorMessages.addProductSuccess;                
                        res.redirect(siteUrls.sellerProducts);                               
                    }            
                });
            }
        
        });
    }
    else
        {
            res.redirect(siteUrls.login);
        }
}

module.exports.productsList=function(req,res){    
    sess=req.session;
    
    if(sess.token && sess.userRole==2){
         connection.query('SELECT * FROM products WHERE productCreatedBy = ?',[sess.userId], function (error, results, fields) {
          if (error) {
              res.render('./products',{error:error,layout:'seller',newproductpagelink:siteUrls.sellerAddProduct,updateproduct:siteUrls.sellerUpdateProduct,title:'Products',flasherror:sess.error,flashmessage:sess.message});
          }else{
            console.log(results);
            res.render('./products',{results:results,layout:'seller',label:labels,newproductpagelink:siteUrls.sellerAddProduct,updateproduct:siteUrls.sellerUpdateProduct,title:'Products',flasherror:sess.error,flashmessage:sess.message});
            
          }
        });
         sess.error='';
            sess.message='';
    }
    else
        {
            res.redirect(siteUrls.login);
        }
}

module.exports.updateproduct=function (req,res){
    sess=req.session;
    if(sess.token && sess.userRole==2){

        connection.query('SELECT * FROM products WHERE productId= ? AND productCreatedBy= ?',[req.query.productid,sess.userId], function (error, results, fields) {
              if (error) {
                sess.error=error;                
                sess.formData=results;            
                res.redirect(siteUrls.sellerProducts);   
              }else{
                if (!results.length) {
                    sess.error='';                
                    sess.formData='';            
                    res.redirect(siteUrls.sellerProducts);   
                  }
                  else{
                    sess.formData=results[0];  
                    addproducts.header="Update Product";
                    var view = {
                    wizarddata: addproducts,
                    categories: categories,
                    addproduct:siteUrls.sellerUpdateProduct,
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
                res.render('addproduct',view);                           
                }      
                }      
            });

        
    }
    else
    {
        res.redirect(siteUrls.sellerProducts);
    }
}

module.exports.updateProductData=function(req,res){    
    sess=req.session;
    if(sess.token && sess.userRole==2){
        (new multiparty.Form()).parse(req, function (err, fields, files) {   
         req.body=fields;  
         var today = new Date();
            var products={
                "productName":req.body.productName[0],
                "productCategory":req.body.productCategory[0],
                "productSubcategory":req.body.productSubcategory[0],
                "productSku":req.body.productSku[0],
                "productPrice":req.body.productPrice,
                "productSellingPrice":req.body.productSellingPrice[0],
                "productSalePrice":req.body.productSalePrice[0],
                "productDescription":req.body.productDescription[0],                
                               
            };

            if(typeof req.body.productMain==undefined || req.body.productMain==undefined || req.body.productMain==null || req.body.productMain=="undefined")
                {
                    products.productMain=0;
                }
            else
                products.productMain=1;

            if(typeof req.body.productDisplay==undefined || req.body.productDisplay==undefined || req.body.productDisplay==null || req.body.productDisplay=="undefined")
                {
                    products.productDisplay=0;
                }
            else
                products.productDisplay=1;

             if(files.productImage[0].size>0){
                var file_to_save='image_'+ randtoken.generate(16) + new Date().getFullYear() + '___profile.' + files.productImage[0].originalFilename;
                var oldpath = files.productImage[0].path;
                var newpath = 'C:/Users/user/Desktop/productimages/'+file_to_save;
                if (path.extname(files.productImage[0].path).toLowerCase() === '.png' || path.extname(files.productImage[0].path).toLowerCase() === '.jpg' || path.extname(files.businessLogo[0].path).toLowerCase() === '.jpeg' || path.extname(files.businessLogo[0].path).toLowerCase() === '.gif') {
                    fs.rename(oldpath, newpath, function(err) {
                        console.log("entered2");
                        if (err) {
                            product.productImage=oldpath;
                            console.log(err);
                            sess.error=ErrorMessages.imageUploadingError;                            
                            sess.formData=products;            
                            res.redirect(siteUrls.sellerAddProduct);
                        }
                        else{
                            console.log("--------------------------297-----------------------------------------");
            
                                console.log("entered3");
                                console.log(file_to_save);
                                products.productImage=file_to_save;            
                                connection.query('UPDATE products SET ? WHERE productId='+req.body.productId+' AND productCreatedBy='+sess.userId,[products], function (error, results, fields) {
                                  if (error) {
                                    console.log(error);
                                    sess.error=ErrorMessages.updateProductError;                
                                    sess.formData=results;            
                                    res.redirect(siteUrls.sellerUpdateProduct);   
                                  }else{
                                        sess.error=''; 
                                        sess.message=ErrorMessages.updateProductSuccess;                
                                        res.redirect(siteUrls.sellerProducts);                              
                                    }            
                                });               
                            }    
                    });
                } else {
                    fs.unlink(newpath, function () {
                            sess.error=ErrorMessages.imageExtError;                            
                            sess.formData=products;          
                            res.redirect(siteUrls.listbusiness);   
                        
                    });
                }     
            }            
            else
                {
                    connection.query('UPDATE products SET ? WHERE productId='+req.body.productId+' AND productCreatedBy='+sess.userId,[products], function (error, results, fields) {
                      if (error) {
                        console.log(error);
                        sess.error=ErrorMessages.updateProductError;                
                        sess.formData=results;            
                        res.redirect(siteUrls.sellerUpdateProduct);   
                      }else{
                            sess.error=''; 
                            sess.message=ErrorMessages.updateProductSuccess;                
                            res.redirect(siteUrls.sellerProducts);                              
                        }            
                    });
                }
        }); 
    }
    else
        {
            res.redirect(siteUrls.login);
        }
}


module.exports.deleteproduct=function(req,res){    
    sess=req.session;
    if(sess.token && sess.userRole==2){        
           
            connection.query('DELETE FROM products WHERE productId='+req.query.productid+' AND productCreatedBy='+sess.userId,[], function (error, results, fields) {
              if (error) {
                console.log(error);
                sess.error=ErrorMessages.deleteProductError;                
                res.redirect(siteUrls.sellerProducts);   
              }else{
                    sess.error=''; 
                    sess.message=ErrorMessages.deleteProductSuccess;                
                    res.redirect(siteUrls.sellerProducts);                              
                }            
            });
         
    }
    else
        {
            res.redirect(siteUrls.login);
        }
}
