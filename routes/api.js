var express = require('express');
var router = express.Router();
var Login = require('../models/login');
var Wish = require('../models/wish');
var User = require('../models/user');

router.post('/signin', function (req, res) {
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

router.post('/signup', function (req, res) {
    try {
        var login = req.body.login;
        if (login) {
            var u = new Login(login);
            u.processSignup(function(result){
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
        console.log(e);
    }
});

router.get('/user/:uid', function (req, res) {
    try {
        if (req.header("x-gt-auth")) {
            var login = new Login({token: req.header("x-gt-auth")});
            login.findUser(function (result) {
                if (result) {
                    if (result._id) {
                        if(req.params.uid=="me"){
                            res.send(result);
                        } else {
                            var user=new User({_id:req.params.uid});
                            user.find(function(result){
                                if(result && result._id==req.params.uid){
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

router.post('/wish', function (req, res) {
    try {
        if (req.header("x-gt-auth")) {
            var login = new Login({token: req.header("x-gt-auth")});
            login.findUser(function (result) {
                if (result) {
                    if (result._id) {
                        var wish=new Wish(req.body.wish);
                        wish.data.user_id=result._id;
                        wish.save(function(result){
                            res.send(result);
                        });
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

router.get('/user/:uid/wishes', function (req, res) {
    try {
        if (req.header("x-gt-auth")) {
            var login = new Login({token: req.header("x-gt-auth")});
            login.findUser(function (result) {
                if (result) {
                    if (result._id) {
                        if(req.params.uid=='me'){
                            res.send(result.wishes);
                        } else {
                            var user=new User({_id:req.params.uid});
                            user.find(function(result){
                                if(result && result._id==req.params.id){
                                    res.send(result.wishes);
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
