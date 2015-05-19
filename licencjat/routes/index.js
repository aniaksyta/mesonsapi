var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/test", { native_parser : true });
/*
 * GET home page.
 */

exports.index = function (req, res) {
    db.collection('mesons').find().toArray(function (err, items) {
        res.json(items);
    });
    
};