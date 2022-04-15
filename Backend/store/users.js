var mongo = require("mongodb");
const { add } = require("./messages");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
var mongoose = require("mongoose");
const eventsStore = require("./events");

const retrieveData = () => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("usersdb");
    dbo
      .collection("users")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        result.forEach(addUser);
        db.close();
      });
  });
};

const sendToDatabase = (input_user) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("usersdb");
    dbo.collection("users").insertOne(input_user, function (err, res) {
      if (err) throw err;
      console.log("1 user inserted");
      addUser(input_user);
      db.close();
    });
  });
};

retrieveData();

let users = [];

const getUsers = () => {
  retrieveData();
  return users;
};

const getUserById = (id) => {
  return users.find((user) => user.id === id);
};

const getUserByEmail = (email) => users.find((user) => user.email === email);

const addUser = (user) => {
  var newUser = new Object();

  try {
    newUser["id"] = user["_id"].toString();
  } catch (error) {
    sendToDatabase(user);
    return;
  }
  newUser["name"] = user["name"];
  newUser["email"] = user["email"];
  newUser["password"] = user["password"];
  newUser["movies"] = user["movies"];

  let found = false;
  users.forEach((item) => {
    if (item["id"] == newUser["id"]) {
      found = true;
    }
  });

  if (found == false) {
    console.log(
      "needs to be added to users list (length: " + users.length + ")"
    );
    users.push(newUser);
  }
};

const getMovies = (userId) => {
  console.log("USER ID ---------> " + userId);
  retrieveData();
  const user = getUserById(userId);
  return user.movies;
};

const updateUsersDatabase = (userId, movies_list) => {
  var id = mongoose.Types.ObjectId(userId);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("usersdb");
    var myquery = { _id: id };

    var newvalues = { $set: { movies: movies_list } };
    dbo.collection("users").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
};

const updateLiking = (userId, movieObject) => {
  retrieveData();
  movies_list = getUserById(userId).movies;

  // If movieId is in movies_list - then remove:
  // If movieId is not in movies_list - then add:
  let response;

  const index = movies_list.indexOf(movieObject);

  for (i = 0; i < movies_list.length; i++) {
    if (movies_list[i].id === movieObject.id) {
      movies_list.splice(i, 1);

      response = "Successfly unliked movie.";
      updateUsersDatabase(userId, movies_list);
      console.log(response);
      return response;
    }
  }

  movies_list.push(movieObject);
  response = "Successfly liked movie.";
  updateUsersDatabase(userId, movies_list);
  console.log(response);
  return response;
};

module.exports = {
  getUsers,
  getUserByEmail,
  getUserById,
  addUser,
  getMovies,
  updateLiking,
};
