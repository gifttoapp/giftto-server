var Promise = require('promise');
var randtoken = require('rand-token');
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/giftto", {native_parser: true});
var logins = Promise.denodeify(db.collection('logins'));
logins.findOne = Promise.denodeify(logins.findOne);
logins.insert = Promise.denodeify(logins.insert);
logins.update = Promise.denodeify(logins.update);

var User = require('./user');
function Login(data) {
    this.email = data.email;
    this.pwd = data.pwd;
    this.token = data.token;
    this.user_id = data.user_id;
    this.full_name = data.full_name;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.birth_day = data.birth_day;
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
            var u = new User({created_at: new Date(), full_name: login.full_name, first_name: login.first_name, last_name: login.last_name, birth_day: login.birth_day});
            u.save(function (result) {
                login.user_id = result._id.toString();
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
                (result.email == login.email && (result.pwd != login.pwd || !result.pwd))
                && (result.token != login.token)
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
    if (this.email) {
        f.email = this.email;
    } else {
        f = this;
    }
    return logins.findOne(f);
}

Login.prototype.findUser = function () {
    this.find().then(function (result) {
        if (result && result.user_id) {
            var u = new User({_id: result.user_id});
            return u.find();
        } else {
            return Promise.resolve({error: "no user found", code: "no-user-found"});
        }
    });
}

module.exports = Login;