var mongo = require("mongodb");
const { add } = require("./messages");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

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

module.exports = {
  getUsers,
  getUserByEmail,
  getUserById,
  addUser,
};
