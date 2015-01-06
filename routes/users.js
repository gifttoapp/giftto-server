var express = require('express');
var router = express.Router();
var Login = require('../models/login');

router.get('/:id', function (req, res) {
    try {
        if (req.header("x-gt-auth")) {
            var login = new Login({token: req.header("x-gt-auth")});
            login.findUser(function (result) {
                if (result) {
                    if (result._id) {
                        if(req.params.id=="me"){
                            res.send(result);
                        } else {
                            var user=new User({_id:req.params.id});
                            user.find(function(result){
                               if(result && result._id==req.params.id){
                                   res.send(result);
                               } else {
                                   res.send({error: "user not found"});
                               }
                            });
                        }
                    } else {
                        res.send({error: "invalid auth header", code: "invalid-auth"});
                    }
                } else {
                    res.send({error: "invalid auth header", code: "invalid-auth"});
                }
            });
        } else {
            res.send({error: "missing auth header", code: "missing-auth"});
        }
    } catch (e) {
        res.send(e, 500);
    }

});

module.exports = router;
