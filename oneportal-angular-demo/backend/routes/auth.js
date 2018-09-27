const express = require('express');
const Joi = require("joi");
const request = require("request");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Cryptr = require("cryptr");

var conf;

try {
    // conf = require("/etc/oneportal-angular-demo/oneportal-ng-demo-conf.json");
    conf = require("../conf.json");
} catch (error) {
    console.log("conf not found");
    console.log(error);
}

if (conf != undefined) {

    const oidc_client_token = conf.OIDC_CLIENT_TOKEN;
    const client_id = conf.OIDC_CLIENT_ID;
    const client_secret = conf.OIDC_CLIENT_SECRET;
    const grant_type = conf.OIDC_GRANT_TYPE;

    const crypt = new Cryptr(client_secret);   // create a key which is used to encrypt data

    // const client_uri = conf.CLIENT_URI;  // !! change for production
    const client_uri = conf.CLIENT_URI_LOCAL;  // !! change for local

    // -------- POST
    // for POST requests
    router.post('/code/', (req, res, next) => {

        console.log("show req in send code");
        console.log(req.body);
        console.log("value");
        console.log(req.body.value);

        const schema = {
            value: Joi.string().required()
        }

        const result = Joi.validate(req.body, schema);

        if (result.error) {
            res.status(400).send(result.error.details[0].message);
            return;
        }

        request.post(
            `${oidc_client_token}?code=${req.body.value}&client_id=${client_id}&client_secret=${client_secret}&grant_type=${grant_type}&redirect_uri=${client_uri}`,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            },
            (error, response, body) => {

                if (error) {
                    console.log("error occurred");
                    console.log(error);
                }

                if (!error && response.statusCode == 200) {
                    let res2 = JSON.parse(response.body);
                    let createTime = Date.now();

                    let expires_in = 1 * 15 * 60 * 1000; // 15min

                    let tokenExpireTime = createTime + expires_in;

                    let tokenObj = {
                        accessToken: res2.access_token,
                        IDToken: res2.id_token,
                        refreshToken: res2.refresh_token,
                        expiryTime: tokenExpireTime
                    }

                    // create a new signed token
                    let signedtoken = jwt.sign(tokenObj, client_secret, {
                        expiresIn: "1h"
                    });

                    console.log("Show signed token");
                    console.log(signedtoken);

                    const encodedToken = crypt.encrypt(signedtoken);

                    console.log("show encoded token");
                    console.log(encodedToken);


                    if (res2.access_token != undefined && res2.id_token != undefined) {

                        res.cookie("crypt_token-x12s", encodedToken, {
                            maxAge: 1 * 60 * 60 * 1000,
                            httpOnly: false
                        })

                        let isValid = true;

                        res.status(200).json({
                            message: "code exchange successfull",
                            token: encodedToken,
                            isValid: isValid,
                            expires_in: expires_in
                        });

                    }

                }
            });
    });


    // get user info
    router.get('/user/', (req, res, next) => {

        console.log("in user info");

        console.log(req.headers.authorization);

        const token = req.headers.authorization.split(" ")[1];

        console.log("token");
        console.log(token);

        if (token.indexOf("null") == 1) {
            res.status(200).clearCookie().json({
                auth: false,
                message: "Failed to authenticate token",
                boolValue: false
            });
        }

        if (token.indexOf("null") == -1) {
            console.log("ENTER");

            let decryptedToken = crypt.decrypt(token);

            console.log(decryptedToken);

            if (decryptedToken != null) {
                console.log("not null after decryption");

                jwt.verify(decryptedToken, client_secret, function (err, decoded) {
                    if (err) {
                        console.log("error after verify");
                        console.log(err);
                        return res.status(200).clearCookie("crypt_token-x12s").json({
                            auth: false,
                            message: 'Failed to authenticate token.',
                            boolValue: false
                        })
                    }

                    let dateNow = Date.now();
                    console.log(dateNow);

                    console.log("Show decoded token obj");
                    console.log(decoded);

                    let timeDifference = decoded.expiryTime - dateNow;
                    console.log(timeDifference);

                    console.log("everything correct return true");
                    if (!err && decoded.accessToken != undefined && timeDifference > 0) {

                        request.get(
                            conf.OIDC_USERINFO,
                            {
                                headers: {
                                    "Authorization": "Bearer " + decoded.accessToken
                                }
                            },
                            (error, response) => {

                                if (error) {
                                    console.log("error occurred");
                                    console.log(error.message);
                                    res.status(200).clearCookie("crypt_token-x12s").json({
                                        auth: false,
                                        message: 'Failed to authenticate token.',
                                        boolValue: false
                                    })
                                }

                                if (!error && response.statusCode == 200) {

                                    console.log("Show response body");
                                    console.log(response.body);

                                    let res2 = JSON.parse(response.body);
                                    console.log(res2);

                                    res.status(200).json({
                                        message: "userinfo retrieve successfull",
                                        email: res2.email,
                                        given_name: res2.given_name,
                                        family_name: res2.family_name,
                                        preferred_username: res2.preferred_username
                                    })

                                }
                            });
                    }

                });
            } else {
                console.log(decryptedToken);

                return res.status(200).clearCookie().json({
                    auth: false,
                    message: "Failed to authenticate token",
                    boolValue: false
                });
            }
        }

    });


    router.get('/destroysession', (req, res) => {
        res.clearCookie('crypt_token-x12s', { path: '/' }).status(200).json({ message: 'Cookie deleted.', auth: false });
    });

    router.get("/validatetoken/", (req, res, next) => {

        console.log("in validatetoken");
        console.log(req.headers.authorization);

        const token = req.headers.authorization.split(" ")[1];

        console.log("token from cookie");
        console.log(token);

        if (token.indexOf("null") == 1) {
            res.status(200).clearCookie().json({
                auth: false,
                message: "Failed to authenticate token",
                boolValue: false
            });
        }

        if (token.indexOf("null") == -1) {
            console.log("ENTER");

            let decryptedToken = crypt.decrypt(token);

            console.log(decryptedToken);

            if (decryptedToken != null) {
                console.log("not null after decryption");

                jwt.verify(decryptedToken, client_secret, function (err, decoded) {
                    if (err) {
                        console.log("error after verify");
                        console.log(err);
                        return res.status(200).clearCookie("crypt_token-x12s").json({
                            auth: false,
                            message: 'Failed to authenticate token.',
                            boolValue: false
                        })
                    }

                    let dateNow = Date.now();
                    console.log(dateNow);

                    console.log("Show decoded token obj");
                    console.log(decoded);

                    let timeDifference = decoded.expiryTime - dateNow;
                    console.log(timeDifference);

                    console.log("everything correct return true");
                    if (!err && decoded.accessToken != undefined && timeDifference > 0) {
                        return res.status(200).json({
                            boolValue: true
                        })
                    }
                });
            } else {
                console.log(decryptedToken);
                return res.status(200).clearCookie().json({
                    auth: false,
                    message: "Failed to authenticate token",
                    boolValue: false
                })
            }
        }

        else {
            console.log("null value token, check cookie");

            // check cookie
            let cookie = req.headers.cookie;

            if (cookie == undefined) {
                res.status(200).clearCookie("crypt_token-x12s").json({
                    auth: false,
                    message: 'Failed to authenticate token.',
                    boolValue: false
                })
            }

            if (cookie != undefined) {

                let foundToken;

                let cookieArray = [];
                let allCookies = cookie;
                let cookies = allCookies.split(";");
                for (var i = 0; i < cookies.length; i++) {
                    cookieArray.push(cookies[i]);
                }

                for (var i = 0; i < cookieArray.length; i++) {

                    if (cookieArray[i].indexOf("crypt_token-x12s") != -1) {
                        foundToken = cookieArray[i];
                    } else {
                        console.log("NOT FOUND");
                    }
                }

                console.log("show found token");
                console.log(foundToken);

                if (foundToken != undefined) {

                    console.log("show found token in not undefined");
                    console.log(foundToken);

                    let parsedToken = foundToken.substring(foundToken.indexOf("crypt_token-x12s") + 17);
                    console.log(parsedToken);

                    let decryptedToken = crypt.decrypt(parsedToken);

                    console.log(decryptedToken);

                    if (decryptedToken != null) {
                        console.log("not null after decryption");

                        jwt.verify(decryptedToken, client_secret, function (err, decoded) {
                            if (err) {
                                console.log("error after verify");
                                console.log(err);
                                return res.status(200).clearCookie("crypt_token-x12s").json({
                                    auth: false,
                                    message: 'Failed to authenticate token.',
                                    boolValue: false
                                })
                            }

                            console.log("Show decoded token obj");
                            console.log(decoded);
                            console.log("everything correct return true");
                            return res.status(200).json({
                                boolValue: true
                            })

                        });
                    } else {
                        console.log(decryptedToken);
                        return res.status(200).clearCookie().json({
                            auth: false,
                            message: "Failed to authenticate token",
                            boolValue: false
                        })
                    }
                }
            }
        }

    });

}

module.exports = router;
