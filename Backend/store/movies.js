var mongo = require("mongodb");
var mongoose = require("mongoose");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

const retrieveData = () => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("moviesdb");
    dbo
      .collection("movies")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        result.forEach(addMovie);
        db.close();
      });
  });
};

retrieveData();

let movies = [];

const addMovie = (movie) => {
  var newMovie = new Object();

  try {
    newMovie["id"] = movie["_id"].toString();
  } catch (error) {
    //sendToDatabase(movie);
    return;
  }
  newMovie["Title"] = movie["Title"];
  newMovie["Plot"] = movie["Plot"];
  newMovie["Genre"] = movie["Genre"];
  newMovie["Ratings_Value"] = movie["Ratings_Value"];
  newMovie["Poster"] = movie["Poster"];

  let found = false;
  movies.forEach((item) => {
    if (item["id"] == newMovie["id"]) {
      found = true;
    }
  });

  if (found == false) {
    console.log(
      "needs to be added to movies list (length: " + movies.length + ")"
    );
    movies.push(newMovie);
  }
};
const getMovieByTitle = (Title) =>
  movies.find((movie) => movie.Title === Title);

const getMovie = (movieTitle) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("moviesdb");
    var query = { title: movieTitle };
    dbo
      .collection("movies")
      .find(query)
      .toArray(function (err, result) {
        if (err) {
          throw err;
        }
        db.close();
        return result;
      });
  });
};

module.exports = { getMovie, getMovieByTitle };
