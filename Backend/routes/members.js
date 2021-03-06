const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { Expo } = require("expo-server-sdk");

const usersStore = require("../store/users");
const eventsStore = require("../store/events");
const messagesStore = require("../store/messages");
const sendPushNotification = require("../utilities/pushNotifications");
const auth = require("../middleware/auth");
const validateWith = require("../middleware/validation");

const schema = {
  eventId: Joi.string().required(),
};

router.get("/", auth, (req, res) => {
  const members = eventsStore.getMembers(req.query.eventId);
  res.send(members);
});

router.post("/", [auth, validateWith(schema)], (req, res) => {
  const { eventId } = req.body;
  const userId = req.user.userId;

  const event = eventsStore.getEvent(eventId);
  if (!event) return res.status(400).send({ error: "Invalid eventId." });

  const targetUser = usersStore.getUserById(userId);
  if (!targetUser) return res.status(400).send({ error: "Invalid userId." });

  let response = eventsStore.updateMember(userId, eventId);

  const { expoPushToken } = targetUser;

  if (Expo.isExpoPushToken(expoPushToken))
    sendPushNotification(expoPushToken, response);

  res.status(201).send();
});

module.exports = router;
