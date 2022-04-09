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
  message: Joi.string().required(),
};

router.get("/", auth, (req, res) => {
  const messages = messagesStore.getMessagesForUser(req.user.userId);

  const mapUser = (userId) => {
    const user = usersStore.getUserById(userId);
    return { id: user.id, name: user.name };
  };

  const resources = messages.map((message) => ({
    id: message.id,
    eventId: message.eventId,
    dateTime: message.dateTime,
    content: message.content,
    fromUser: mapUser(message.fromUserId),
    toUser: mapUser(message.toUserId),
  }));
  res.send(resources);
});

router.post("/", [auth, validateWith(schema)], async (req, res) => {
  const { eventId, message } = req.body;

  const event = eventsStore.getEvent(eventId);
  if (!event) return res.status(400).send({ error: "Invalid eventId." });

  const targetUser = usersStore.getUserById(event.userId);
  if (!targetUser) return res.status(400).send({ error: "Invalid userId." });

  messagesStore.add({
    fromUserId: req.user.userId,
    toUserId: event.userId,
    eventId,
    content: message,
  });

  const { expoPushToken } = targetUser;

  if (Expo.isExpoPushToken(expoPushToken))
    await sendPushNotification(expoPushToken, message);

  res.status(201).send();
});

module.exports = router;
