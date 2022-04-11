const express = require("express");
const router = express.Router();

const store = require("../store/events");
const auth = require("../middleware/auth");
const eventMapper = require("../mappers/events");

router.get("/:id", auth, (req, res) => {
  const event = store.getEvent(parseInt(req.params.id));
  if (!event) return res.status(404).send();
  const resource = eventMapper(event);
  res.send(resource);
});

router.post("/", auth, (req, res) => {
  console.log("Trying to delete event");
  const { eventObject } = req.body;
  const response = store.deleteEvent(eventObject);
  res.send(response);
});

module.exports = router;
