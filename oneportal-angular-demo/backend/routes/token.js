const express = require('express');
const Joi = require("joi");
const router = express.Router();
const request = require("request");

var conf;

try {
    // conf = require("/etc/oneportal-angular-demo/oneportal-ng-demo-conf.json");
    conf = require("../conf.json");
} catch (error) {
    console.log("conf not found");
    console.log(error);
}

var keyDB;
var secretDB;
var Header;
const ONEPORTAL_DB_URI = conf.MGM_API_TOKEN_ENDPOINT;

if (conf != undefined) {

    keyDB = conf.MGM_API_CLIENT_ID;
    secretDB = conf.MGM_API_SECRET;
    ONEPORTAL_MGM_API_DB = conf.MGM_API_TOKEN_ENDPOINT;

    Header = {
        "Content-Type": "application/json",
        "Authorization": "Basic " + new Buffer(keyDB + ":" + secretDB, "utf8").toString("base64")
    }
}

if (conf != undefined) {

     // POST requests  (create and update)
     router.post('/token/', (req, res, next) => {

        const schema = {
            relatedId: Joi.string().required(),
            key: Joi.string().required(),
            value: Joi.string().required()
        }

        const result = Joi.validate(req.body, schema);

        if(result.error) {
            res.status(400).send(result.error.details[0].message);
            return;
        }

        console.log("Show post request");
        console.log(req.body);

        console.log("show URI");
        console.log(ONEPORTAL_DB_URI);

        let id = req.body.relatedId;

        request.post(
            ONEPORTAL_DB_URI,
            {
                json: {
                    relatedId: id,
                    key: req.body.key,
                    value: req.body.value
                },
                headers: Header
            },

            (error, response, body) => {

                if (!error && response.statusCode == 200) {
                    console.log(body)

                    res.status(200).json(body);
                }
                if (error) {
                    console.log("error occurred");
                    console.log(error);
                }
            }
        );

    });

    // GET
     router.get('/token/:id', (req, res, next) => {

        request({
            method: 'GET',
            uri: ONEPORTAL_DB_URI + req.params.id,
            headers: Header
        }, (error, response, body) => {

            if (!error && response.statusCode == 200) {

                // let res1 = JSON.stringify(body);
                // let res2 = JSON.parse(res1);
                // let res3 = JSON.parse(res2);

                let res2 = JSON.parse(body);

                res.status(200).json(res2);

                // res.json(res3);
            }
            if (error) {
                console.log("error occurred");
                console.log(error);
            }
        })
    });


     // DELETE
     router.delete("/token/:id/:key", (req, res, next) => {
 
         request({
             method: 'DELETE',
             uri: ONEPORTAL_DB_URI + req.params.id + "/" + req.params.key,
             headers: Header
         }, (error, response, body) => {
             if (!error && response.statusCode == 200) {

                 res.status(200).json(body);
             }
             if (error) {
                 console.log("error occurred");
                 console.log(error);
             }
         })
     });

}

module.exports = router;
