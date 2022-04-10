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
const moviesStore = require("../store/movies");

router.post("/", auth, (req, res) => {
  const { movieObject } = req.body;
  const userId = req.user.userId;

  let response = usersStore.updateLiking(userId, movieObject);

  res.send();
});

module.exports = router;
