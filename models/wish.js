var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/giftto", {native_parser: true});
var wishes = db.collection('wishes');
var User = require('./user');

function Wish(data) {
    this.data = data;
}

Wish.prototype.save = function (callback) {
    var w=this.data;
    if (!this.data._id) {
        this.data.created_at = new Date();
        this.data.updated_at = new Date();
        wishes.insert(this.data
            , function (err, result) {
                if (err) {
                    callback(err);
                }
                if (result) {
                    var user=new User({_id: w.user_id});
                    user.data.wishes=[w];
                    user.addWishes(function(){});
                    callback(result[0]);
                }
            });
    } else {
        var id = this.data._id;
        delete this.data._id;
        this.data.updated_at = new Date();
        wishes.update({_id: mongo.helper.toObjectID(id)}, {'$set': this.data}
            , function (err, result) {
                if (err) {
                    callback(err);
                }
                if (result) {
                    var user=new User({_id: w.user_id});
                    user.data.wishes=[w];
                    user.addWishes(function(){});
                    callback({msg: "updated"});
                }
            });
    }
}

Wish.prototype.find = function (callback) {
    var f = {};
    f = this.data;
    logins.findOne(f, function (err, result) {
        callback(result)
    });
}

module.exports = Wish;