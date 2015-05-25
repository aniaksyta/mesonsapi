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

exports.getMethod = function (req, res) {
    if (req.params.key === 'Code' || req.params.key === 'Mass' || req.params.key === 'Charge' || req.params.key === 'Life Time' || req.params.key === 'Width' || req.params.key === 'I') {
        if (!isNaN(req.params.value)) {
            db.collection('mesons').find(JSON.parse('{"' + req.params.key + '" : ' + req.params.value + '}')).toArray(function (err, items) {
                if (typeof items !== 'undefined' && items.length > 0) {
                    res.json(items);
                }
                else {
                    res.json({ error: 'value not found' });
                }
                
            });
        }
        else {
            res.json({error: 'value is incorrect'});
        }
        
    }
    else {
        db.collection('mesons').find(JSON.parse('{"' + req.params.key + '" : "' + req.params.value + '"}')).toArray(function (err, items) {
            if (typeof items !== 'undefined' && items.length > 0) {
                res.json(items);
            }
            else {
                res.json({ error: 'value not found' });
            }
        });
    }
    
};

exports.postMethod = function (req, res) {
    if (!isNaN(req.body.Code) && !isNan(req.body.Mass) && !isNaN(req.body.Charge) && !isNaN(req.body.LifeTime) && !isNaN(req.body.Width) && !isNan(req.body.I) ) {
        var newMeson = "{ \"Code\": " + req.body.Code + ", \"Name\": \"" + req.body.Name + "\", \"Mass\": " + req.body.Mass + ", \"Charge\": " + req.body.Charge + ", \"Life Time\": " + req.body.LifeTime + ", \"Anti-Particle\": \"" + req.body.AntiParticle + "\", \"Type\": \"" + req.body.Type + "\", \"Width\": " + req.body.Width + ", \"I\": \"" + req.body.I + "\", \"J^(PC)\": \"" + req.body.JPC + "\", \"Magnetic Moment\": \"" + req.body.MagneticMoment + "\" }";
        db.collection('mesons').insert(JSON.parse(newMeson), { safe: true }, function (err, result) {
            if (err)
                res.json({ error: 'not added' })
            if (result)
                res.json({ result: 'added' });
        });
    } else {
        res.json({ error: 'wrong value' });

    }
};

