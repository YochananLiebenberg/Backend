const express = require("express");
const router = express.Router();

const usersStore = require("../store/users");
const eventsStore = require("../store/events");
const auth = require("../middleware/auth");

router.get("/:id", auth, (req, res) => {
  const userId = req.params.id;
  const user = usersStore.getUserById(userId);
  if (!user) return res.status(404).send();

  const events = eventsStore.filterEvents((event) => event.userId === userId);

  res.send({
    id: user.id,
    name: user.name,
    email: user.email,
    events: events.length,
  });
});

module.exports = router;
