const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const api = express();

// custom config
const settings = require('../config/settings');

// body parse middleware
api.use(bodyParser.json());

api.get('/getFlipkartCategories',(req,response,next)=>{
    var options = {
        host: settings.flipkart.url,
        port: 443,
        path: '/affiliate/api/'+settings.flipkart.trackingId+'.json',
        method: 'GET',
        headers: {
            "Fk-Affiliate-Id": settings.flipkart.trackingId, 
            "Fk-Affiliate-Token": settings.flipkart.token 
        }
    };

    https.get(options, function(res) {
        console.log("Got response: " + res.statusCode);
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            var data = JSON.parse(body);
            response.json(data);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
});

api.get('/getFlipkartTopSellingProducts/:cat',(req,response,next)=>{
    var options = {
        host: settings.flipkart.url,
        port: 443,
        path: '/affiliate/topFeeds/'+settings.flipkart.trackingId+'/category/'+req.params.cat+'.json?expiresAt=1499145916313&sig=06a3f389a4954b3ecf49debdda1d4927',
        method: 'GET',
        headers: {
            "Fk-Affiliate-Id": settings.flipkart.trackingId, 
            "Fk-Affiliate-Token": settings.flipkart.token 
        }
    };
    console.log(options);
    https.get(options, function(res) {
        console.log("Got response: " + res.statusCode);
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            var data = JSON.parse(body);
            response.json(data);
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
});

module.exports = api;