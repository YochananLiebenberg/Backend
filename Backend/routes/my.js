const express = require("express");
const router = express.Router();

const eventsStore = require("../store/events");
const auth = require("../middleware/auth");
const eventMapper = require("../mappers/events");

router.get("/events", auth, (req, res) => {
  const events = eventsStore.filterEvents(
    (event) => event.userId === req.user.userId
  );
  const resources = events.map(eventMapper);
  res.send(resources);
});

module.exports = router;
