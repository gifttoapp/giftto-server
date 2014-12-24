var express = require('express');
var router = express.Router();
var Login = require('../models/login');
var bodyParser = require('body-parser')

router.use(bodyParser.json());

router.post('/do', function (req, res) {
    try {
        var login = req.body.login;
        if (login) {
            var u = new Login(login);
            u.processSignin(function(result){
                if(result.error){
                    res.send(result,500);
                } else {
                    res.send(result);
                }
            });
        } else {
            res.send({error:"no data sent in request body",code:"empty-request-body"},500);
        }
    } catch (e) {
        res.send(e,500);
    }
});

module.exports = router;
