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
const { ConnectionClosedEvent } = require("mongoose/node_modules/mongodb");

router.get("/", auth, (req, res) => {
  members = eventsStore.getMembers(req.query.id);

  const groups_movies = [];

  for (let i = 0; i < members.length; i++) {
    let usersMovies = usersStore.getMovies(members[i].id);

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
    fetchMovieJSON(myJSON)
      .then((movies) => {
        for (let i = 0; i < movies.length; i++) {
          groups_movies.push(movies[i]);
        }
      })
      .then(() => {
        // Sort groups_movies by most repeats
        var map = groups_movies.reduce(function (p, c) {
          p[c] = (p[c] || 0) + 1;
          return p;
        }, {});

        var groups_movies_sorted = Object.keys(map).sort(function (a, b) {
          return map[b] - map[a];
        });

        // Create a new list and add the movie objects to it
        final_grouped_movies_sorted = [];
        for (let i = 0; i < groups_movies_sorted.length; i++) {
          final_grouped_movies_sorted.push(
            moviesStore.getMovieByTitle(groups_movies_sorted[i])
          );
        }
        eventsStore.updateRecommendationsDatabase(
          req.query.id,
          final_grouped_movies_sorted
        );
      });
  }
  res.send("Updated Events");
});

module.exports = router;
