var mongo = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

const retrieveData = () => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("messagesdb");
    dbo
      .collection("messages")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        result.forEach(add);
        db.close();
      });
  });
};

const sendToDatabase = (input_message) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("messagesdb");
    dbo.collection("messages").insertOne(input_message, function (err, res) {
      if (err) throw err;
      console.log("1 message inserted");
      add(input_message);
      db.close();
    });
  });
};

retrieveData();

const messages = [];

const getMessagesForUser = (toUserId) =>
  messages.filter((message) => message.toUserId === toUserId);

const add = (message) => {
  var newMessage = new Object();

  try {
    newMessage["id"] = message["_id"].toString();
  } catch (error) {
    sendToDatabase(message);
    return;
  }
  newMessage["fromUserId"] = message["fromUserId"];
  newMessage["toUserId"] = message["toUserId"];
  newMessage["eventId"] = message["eventId"];
  newMessage["content"] = message["content"];
  newMessage["dateTime"] = Date.now();

  let found = false;
  messages.forEach((item) => {
    if (item["id"] == newMessage["id"]) {
      found = true;
    }
  });

  if (found == false) {
    console.log(
      "needs to be added to messages list (length: " + messages.length + ")"
    );
    messages.push(newMessage);
  }
};

module.exports = { add, getMessagesForUser };
