var mongo = require("mongodb");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

const retrieveData = () => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("eventsdb");
    dbo
      .collection("events")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        result.forEach(addEvent);
        db.close();
      });
  });
};

const sendToDatabase = (input_event) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("eventsdb");
    dbo.collection("events").insertOne(input_event, function (err, res) {
      if (err) throw err;
      console.log("1 event inserted");
      addEvent(input_event);
      db.close();
    });
  });
};

retrieveData();

let events = [];

const addEvent = (event) => {
  var newEvent = new Object();

  try {
    newEvent["id"] = event["_id"].toString();
  } catch (error) {
    sendToDatabase(event);
    return;
  }
  newEvent["title"] = event["title"];
  newEvent["images"] = event["images"];
  newEvent["categoryId"] = event["categoryId"];
  newEvent["time"] = event["time"];
  newEvent["userId"] = event["userId"];
  newEvent["location"] = event["location"];

  let found = false;
  events.forEach((item) => {
    if (item["id"] == newEvent["id"]) {
      found = true;
    }
  });

  if (found == false) {
    console.log(
      "needs to be added to events list (length: " + events.length + ")"
    );
    events.push(newEvent);
  }
};

const getEvents = () => {
  retrieveData();
  return events;
};

const getEvent = (id) => events.find((event) => event.id === id);

const filterEvents = (predicate) => events.filter(predicate);

module.exports = {
  addEvent,
  getEvents,
  getEvent,
  filterEvents,
};
