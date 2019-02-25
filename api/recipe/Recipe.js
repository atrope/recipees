var mongoose = require('mongoose');
var RecipeSchema = new mongoose.Schema({
  title: String,
  ingredients: {
    name: {type: String},
    quantity: {type: Number},
    type: {type: String},
    }

});
mongoose.model('Recipe', RecipeSchema);

module.exports = mongoose.model('Recipe');
