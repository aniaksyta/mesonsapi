var mongo = require('mongoskin');
//var db = mongo.db("mongodb://localhost:27017/test");
var db = mongo.db("mongodb://Test:test123@apollo.modulusmongo.net:27017/oQ5ymunu", { native_parser : true });

var jwt = require('jsonwebtoken');
var crypto = require('crypto');

var verify = function (token, res, callback) {
    jwt.verify(token, "zaszyfrowanawiadomosc", function (err, decoded) {
        console.log(err, decoded);
        if (err) {
            return res.json({ error: 'Failed to authenticate token.' });
        } else {
            callback(decoded.Admin);
        }
    });
};

exports.index = function (req, res) {
    verify(req.params.token, res, function () {
        db.collection('mesons').find().toArray(function (err, items) {
                res.json(items);
            });
    }); 
};

exports.getMethod = function (req, res) {
    verify(req.params.token, res, function () {
        if (req.params.key === 'Code' || req.params.key === 'Mass' || req.params.key === 'Charge' || req.params.key === 'Life Time' || req.params.key === 'Width' || req.params.key === 'I') {
            if (!isNaN(req.params.value)) {
                db.collection('mesons').find(JSON.parse('{"' + req.params.key + '" : ' + req.params.value + '}')).toArray(function (err, items) {
                    if (typeof items !== 'undefined' && items.length > 0) {
                        res.json(items);
                    } else {
                        res.json({ error : 'value is incorrect' });
                    }
                
                });
            } else {
                res.json({ error: 'value is incorrect' });
            }
        
        } else {
            db.collection('mesons').find(JSON.parse('{"' + req.params.key + '" : "' + req.params.value + '"}')).toArray(function (err, items) {
                if (typeof items !== 'undefined' && items.length > 0) {
                    res.json(items);
                } else {
                    res.json({ error: 'value not found' });
                }
            });
        }  
    });
};

exports.postMethod = function (req, res) {
    verify(req.params.token, res, function (isAdmin) {
        if (isAdmin) {
            if (!isNaN(req.body.Code) && !isNaN(req.body.Mass) && !isNaN(req.body.Charge) && !isNaN(req.body.LifeTime) && !isNaN(req.body.Width)) {
                var newMeson = "{ \"Code\": " + req.body.Code + ", \"Name\": \"" + req.body.Name + "\", \"Mass\": " + req.body.Mass + ", \"Charge\": " + req.body.Charge + ", \"Life Time\": " + req.body.LifeTime + ", \"Anti-Particle\": \"" + req.body.AntiParticle + "\", \"Type\": \"" + req.body.Type + "\", \"Width\": " + req.body.Width + ", \"I\": \"" + req.body.I + "\", \"J^(PC)\": \"" + req.body.JPC + "\", \"Magnetic Moment\": \"" + req.body.MagneticMoment + "\" }";
                db.collection('mesons').insert(JSON.parse(newMeson), { safe: true }, function (err, result) {
                    if (err)
                        res.json({ error: 'not added' });
                    if (result)
                        res.json({ result: 'added' });
                });
            } else {
                res.json({ error: 'wrong value' });
            }
        } else {
            res.json({ error: 'You don\'t have permission to do it' });
        }
    });
};

exports.deleteMethod = function (req, res) {
    verify(req.params.token, res, function (isAdmin) {
        if (isAdmin) {
            db.collection('mesons').remove({ _id: mongo.helper.toObjectID(req.body.id) }, function (err, result) {
                if (err)
                    res.json({ error: 'can\'t delete' });
                if (result)
                    res.json({ result: 'removed' });
            });
        } else {
            res.json({ error: 'You don\'t have permission to do it' });
        }
    });
};

exports.updateMethod = function (req, res) {
    verify(req.params.token, res, function (isAdmin) {
        if (isAdmin) {
            var tmp;
            if (req.params.key === 'Code' || req.params.key === 'Mass' || req.params.key === 'Charge' || req.params.key === 'Life Time' || req.params.key === 'Width' || req.params.key === 'I') {
                tmp = "{ \"" + req.params.key + "\":" + req.params.value + "}";
            } else
                tmp = "{ \"" + req.params.key + "\": \"" + req.params.value + "\" }";
            
            
            db.collection('mesons').update({ _id: mongo.helper.toObjectID(req.params.id) }, { $set : JSON.parse(tmp) }, function (err, result) {
                console.log(err);
                console.log("-------------------------- RESULT ---------------------")
                console.log(result);
                if (err)
                    res.json({ error: 'can\'t updated' })
                if (result)
                    res.json({ result: 'updated' });
                else
                    res.json({ error: 'can\'t updated' });
            });
        } else {
            res.json({ error: 'You don\'t have permission to do it' });
        }
    });
};           


exports.setupMethod = function (req, res) {
    db.collection('users').count(function (err, count) {
        var Admin;
        if (!err && count === 0) {
            Admin = true;
        } else {
            Admin = false;
        }
        db.collection('users').find({ "Name": req.body.Name }).count(function (err, count) {
            if (count === 0) {
                var password = req.body.Password;
                password = crypto.createHash('md5').update(password).digest('hex');
                var newUser = "{ \"Name\": \"" + req.body.Name + "\", \"Password\": \"" + password + "\", \"Admin\": " + Admin + " }";
                console.log(newUser);
                db.collection('users').insert(JSON.parse(newUser), { safe: true }, function (err, result) {
                    if (err)
                        res.json({ error: 'not added' });
                    if (result)
                        res.json({ result: 'added' });
                    else
                        res.json({ error: 'not added' });
                }); 
            } else {
                res.json({ error: 'user already exists' });
            }
        });
        
           
    });

};

exports.authenticateMethod = function (req, res) {
    var password = req.body.Password;
    password = crypto.createHash('md5').update(password).digest('hex');
    db.collection('users').find(JSON.parse("{ \"Name\" : \"" + req.body.Name + "\", \"Password\": \"" + password + "\" }")).toArray(function (err, items) {
        if (typeof items !== 'undefined' && items.length > 0) {
            var token = jwt.sign(items[0], "zaszyfrowanawiadomosc", {
                expiresInMinutes: 30
            });   
            // return the information including token as JSON
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });

        }
        else {
            res.json({ error: 'user not found' });
        }
    });
};

