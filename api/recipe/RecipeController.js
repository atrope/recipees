// UserController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
var Recipe = require('./Recipe');
var Disease = require('./Disease');

// RETURNS LIMIT TOP ingredients from Recipes
router.get('/ingredients/:limit?', (req, res) => {
    var limit = req.params.limit ? parseInt(req.params.limit):999;
    if (!limit) limit = 999;
    Recipe.aggregate([
      {$unwind:"$ingredients"},
      {$group:{_id:"$ingredients.name", total:{$sum:1}}},
      { $sort: { "total": -1 } },
      { $limit: limit }
    ], function(err, recipes) {
      if (err) return res.status(500).send({"message":"There was a problem finding the recipes."});
      dict = {"name": "foods", "children": []}
      let counter = 1;
      recipes.forEach(function (value) {
        dict["children"].push({"position":counter++,"name": value._id, "children": [{"total": value.total}]})
      });
      res.status(200).send(dict);

    });
  });
  router.get('/disease/:name/:type', (req, res) => {
    var disease = req.params.name.toLocaleLowerCase();
    var type = req.params.type.toLocaleLowerCase();
      Disease.findOne({name: disease},function (err, dis) {
        if (err || !dis) return res.status(404).send({"message":"There was no diseases."});
        let ing  = JSON.parse(JSON.stringify(dis.ingredients));
        let ingredients = ing.filter(i => i.type === type).map(i => i.name);

        Recipe.find({ 'ingredients.name': { $all: ingredients } }, 'title',{limit: 50},function (err, rec) {
          if (err) return res.status(500).send({"message":"There was an error."});
          res.status(200).send(rec);
        });
      });
    });


    //   if (!limit) limit = 999;
    //   Recipe.aggregate([
    //     {$unwind:"$ingredients"},
    //     {$group:{_id:"$ingredients.name", total:{$sum:1}}},
    //     { $sort: { "total": -1 } },
    //     { $limit: limit }
    //   ], function(err, recipes) {
    //     if (err) return res.status(500).send({"message":"There was a problem finding the recipes."});
    //     dict = {"name": "foods", "children": []}
    //     let counter = 1;
    //     recipes.forEach(function (value) {
    //       dict["children"].push({"position":counter++,"name": value._id, "children": [{"total": value.total}]})
    //     });
    //     res.status(200).send(dict);
    //
    //   });
    // });

module.exports = router;
