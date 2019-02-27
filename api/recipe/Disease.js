var mongoose = require('mongoose');
var DiseaseSchema = new mongoose.Schema({
  name: String,
  ingredients: {name: {type: String},type: {type: String}}
});
mongoose.model('Disease', DiseaseSchema);
module.exports = mongoose.model('Disease');
