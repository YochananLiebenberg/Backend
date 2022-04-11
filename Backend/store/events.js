var mongo = require("mongodb");
var mongoose = require("mongoose");
const { getUserById } = require("./users");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

const updateMembersDatabase = (eventId, members_list) => {
  var id = mongoose.Types.ObjectId(eventId);
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("eventsdb");
    var myquery = { _id: id };

    var newvalues = { $set: { members: members_list } };
    dbo.collection("events").updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated");
      db.close();
    });
  });
};

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
  newEvent["members"] = event["members"];
  newEvent["userId"] = event["userId"];

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

const getMembers = (eventId) => {
  retrieveData();

  members_list = getEvent(eventId).members;

  let result = [];
  members_list.forEach((memberId) => {
    result.push(getUserById(memberId));
  });
  return result;
};

const updateMember = (userId, eventId) => {
  retrieveData();
  members_list = getEvent(eventId).members;

  // If userId is in members_list - then remove:
  // If userId is not in members_list - then add:
  let response;

  const index = members_list.indexOf(userId);
  if (index > -1) {
    members_list.splice(index, 1);
    response = "Successfly removed from event.";
  } else {
    members_list.push(userId);
    response = "Successfly added to event.";
  }
  console.log(members_list);

  updateMembersDatabase(eventId, members_list);
  return response;
};

const deleteEvent = (eventObject) => {
  retrieveData();
  var id = mongoose.Types.ObjectId(eventObject.id);
  // If eventId is in events - then remove:
  for (i = 0; i < events.length; i++) {
    if (events[i].id === eventObject.id) {
      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("eventsdb");
        var myquery = { _id: id };
        dbo.collection("events").deleteOne(myquery, function (err, obj) {
          if (err) throw err;
          console.log("1 document deleted");
          db.close();
          //events.splice(i, 1);
          events = events.filter(function (item) {
            return item.id !== eventObject.id;
          });
          console.log(events);
          return "1 document deleted";
        });
      });
    }
  }
};

module.exports = {
  addEvent,
  getEvents,
  getEvent,
  filterEvents,
  updateMember,
  getMembers,
  deleteEvent,
};
