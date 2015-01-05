var randtoken = require('rand-token');
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/giftto", {native_parser: true});
var logins = db.collection('logins');

var User = require('./user');
function Login(data) {
    for(var keys = Object.keys(data), l = keys.length; l; --l)
    {
        this[ keys[l-1] ] = data[ keys[l-1] ];
    }
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
    if (!this._id) {
        this.token = this.genToken();
        this.created_at = new Date();
        this.updated_at = new Date();
        logins.insert(this
            , function (err, result) {
                if (err) {
                    callback(err);
                }
                if (result) {
                    callback(result[0]);
                }
            });
    } else {
        var id = this._id;
        delete this._id;
        this.updated_at = new Date();
        logins.update({_id: mongo.helper.toObjectID(id)}, {'$set': this}
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

Login.prototype.find = function (callback) {
    var f = {};
    if (this.email) {
        f.email = this.email;
    } else {
        f = this;
    }
    logins.findOne(f, function (err, result) {
        callback(result)
    });
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