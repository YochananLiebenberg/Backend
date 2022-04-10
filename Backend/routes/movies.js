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

router.get("/", auth, (req, res) => {
  console.log("get all movies for user: " + req.user.userId);
  const movies = usersStore.getMovies(req.user.userId);
  res.send(movies);
});

router.post("/", auth, (req, res) => {
  const { searchItem } = req.body;

  const movie = moviesStore.getMovieByTitle(searchItem.Title);
  if (!movie) return res.status(404).send();
  res.send(movie);
});

module.exports = router;
