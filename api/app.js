// app.js
var express = require('express');
var app = express();
var db = require('./db');
var RecipeController = require('./recipe/RecipeController');
var cors = require('cors');


app.use(cors());
app.use('/recipe', RecipeController);
app.all('*', (req,res,next) => {
  res.status(404).send({"message":"This is crazy, but this page was not found"});
});

module.exports = app;
