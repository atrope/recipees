// UserController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
var Recipe = require('./Recipe');

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
      recipes.forEach(function (value) {
        dict["children"].push({"name": value._id, "children": [{"total": value.total}]})
      });
      res.status(200).send(dict);

    });
  });
module.exports = router;
