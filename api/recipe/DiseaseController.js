// UserController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
var Disease = require('./Disease');
var Recipe = require('./Recipe');

// RETURNS LIMIT TOP ingredients from Recipes

router.get('/', (req, res) => {
    Disease.find({}, (err, diseases) => {
        if (err) return res.status(500).send({"message":"There was a problem finding the diseases."});
        res.status(200).send(diseases);
    });
});

router.get('/:type', (req, res) => {
    var type = req.params.type
    Recipe.aggregate([{$unwind:"$ingredients"},{$group:{_id:"$ingredients.name", total:{$sum:1}}},{ $sort: { "total": -1 } },{ $limit: 50 }], function(err, recipes) {
      if (err) return res.status(500).send({"message":"There was a problem finding the recipes."});
      dict = {}
      let counter = 1;
      recipes.forEach(function (value) { dict[value._id] = counter++;});
      Disease.find({}, (err, diseases) => {
          if (err) return res.status(500).send({"message":"There was a problem finding the diseases."});
          dictend = {"name": "diseases", "children": []}
          diseases.forEach(function (value) {
             newIng = [];
             let ing  = JSON.parse(JSON.stringify(value.ingredients));
              ing.forEach(function (v) {
                  if (v.type === type){
                    v.position = dict[v.name] ? dict[v.name] : -1
                    newIng.push({"name": v.name,"children": [{"name": `Position #${v.position}`}]});
                }
             });
            newj = {"name": value.name,"children":newIng};
            dictend.children.push(newj);
          });
          res.status(200).send(dictend);
        });
      });
    });

module.exports = router;
