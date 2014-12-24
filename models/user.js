var Promise = require('promise');
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/giftto", {native_parser: true});
var users = db.collection('users');
users.findOne = Promise.denodeify(users.findOne);

function User(data) {
    this.data = data;
}

User.prototype.save = function (callback) {
    if (!this.data._id) {
        users.insert(this.data
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
        users.update({_id: mongo.helper.toObjectID(id)}, {'$set': this.data}
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

User.prototype.find = function (callback) {
    if (this.data._id) {
        this.data._id = new mongo.ObjectID(this.data._id);
    }
    users.findOne(this.data, function (err, result) {
        callback(result)
    });
}

User.prototype.addWishes = function (callback) {
    if (this.data._id) {
        var id = this.data._id;
        delete this.data._id;
        users.update({_id: mongo.helper.toObjectID(id)}, {'$push': {wishes: {'$each': this.data.wishes}}}
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

User.prototype.removeWishes = function (callback) {
    if (this.data._id) {
        var id = this.data._id;
        delete this.data._id;
        users.update({_id: mongo.helper.toObjectID(id)}, {'$pull': {wishes: {'$each': this.data.wishes}}}
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

module.exports = User;