var randtoken = require('rand-token');
var Promise = require('promise');
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/giftto", {native_parser: true});
var logins = Promise.denodeify(db.collection('logins'));
logins.findOne = Promise.denodeify(db.collection('logins').findOne);

var User = require('./user');
function Login(data) {
    this.email = data.email;
    this.pwd = data.pwd;
    this.token = data.token;
}

Login.prototype.processSignup = function (callback) {
    var login = this;
    this.find(function (result) {
        if (result) {
            if (result.email) {
                callback({error: "email already exists", code: "email-exists"});
            } else {
                callback(result);
            }
        } else {
            //create user
            var u = new User({created_at: new Date(), full_name: login.data.full_name, first_name: login.data.first_name, last_name: login.data.last_name, birth_day: login.data.birth_day});
            u.save(function (result) {
                login.data.user_id = result._id.toString();
                login.save(function (result) {
                        callback(result);
                    }
                );
            });

        }
    });
}

Login.prototype.processSignin = function (callback) {
    var login = this;
    this.find(function (result) {
        if (result) {
            if (
                (result.email == login.data.email && (result.pwd != login.data.pwd || !result.pwd))
                && (result.token != login.data.token)
                ) {
                callback({error: "wrong email or password", code: "wrong-email-password"});
            } else {
                var r = {token: result.token};
                callback(r);
            }
        } else {
            callback({error: "wrong login info", code: "wrong-login"});
        }
    });
}


Login.prototype.genToken = function () {
    var t = randtoken.generate(16).toString();
    var t1 = randtoken.generate(16).toString();
    var t2 = randtoken.generate(16).toString();
    var t3 = randtoken.generate(16).toString();
    var x = t + t1 + t2 + t3;
    return x;
}

Login.prototype.save = function (callback) {
    if (!this.data._id) {
        this.data.token = this.genToken();
        this.data.created_at = new Date();
        this.data.updated_at = new Date();
        logins.insert(this.data
            , function (err, result) {
                if (err) {
                    callback(err);
                }
                if (result) {
                    callback(result[0]);
                }
            });
    } else {
        var id = this.data._id;
        delete this.data._id;
        this.data.updated_at = new Date();
        logins.update({_id: mongo.helper.toObjectID(id)}, {'$set': this.data}
            , function (err, result) {
                if (err) {
                    callback(err);
                }
                if (result) {
                    callback({msg: "updated"});
                }
            });
    }
}

Login.prototype.find = function () {
    var f = {};
    if (this.data.email) {
        f.email = this.data.email;
    } else {
        f = this.data;
    }
    return logins.findOne(f);
}

Login.prototype.findUser = function (callback) {
    this.find(function (result) {
        if (result && result.user_id) {
            var u = new User({_id: result.user_id});
            u.find(callback);
        } else {
            callback({error: "no user found", code: "no-user-found"});
        }
    });
}

module.exports = Login;