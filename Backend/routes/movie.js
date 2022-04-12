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

const fetch = require("node-fetch");
const axios = require("axios");

router.post("/", auth, (req, res) => {
  const { movieObject } = req.body;
  const userId = req.user.userId;

  let response = usersStore.updateLiking(userId, movieObject);

  res.send();
});

router.get("/", auth, (req, res) => {
  let usersMovies = usersStore.getMovies(req.user.userId);

  // If user had not liked any movies yet:
  if (usersMovies.length == 0) {
    usersMovies = [
      moviesStore.getMovieByTitle("Inception"),
      moviesStore.getMovieByTitle("Toy Story"),
    ];
  }
  const myJSON = JSON.stringify(usersMovies);

  async function fetchMovieJSON(movie_list) {
    var url = new URL("http://127.0.0.1:5000/helloworld");
    var params = { movies: movie_list };
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);
    const recomended_movies = await response.json();
    return recomended_movies;
  }
  fetchMovieJSON(myJSON).then((movies) => {
    movies; // fetched movies

    get_these_movies = [];
    // Pick 6 random movies from the reccomendation list
    for (let i = 0; i < 6; i++) {
      var random_index = Math.floor(Math.random() * movies.length);
      var movie = movies[random_index];
      movies.splice(random_index, 1);
      get_these_movies.push(moviesStore.getMovieByTitle(movie));
    }

    res.send(get_these_movies);
  });
});

module.exports = router;
