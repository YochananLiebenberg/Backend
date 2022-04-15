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

router.get("/", auth, async (req, res) => {
  //Define the MEMBERS LIST of an event. (this should be an up to date version!)
  const members = eventsStore.getMembers(req.query.id);

  let final_grouped_movies_sorted = [];

  // Call FUNCTION 1 with members as the argument.
  //const event_rec_movies = await getRecommendations(members);

  // &&&&&&&&

  let promise = Promise.resolve();

  // Container for holding rec movies for group.
  let groups_movies = [];

  // ----- LOOP 1: -----
  members.forEach((member) => {
    promise = promise.then(async () => {
      // Defining members liked movies.

      // NEW IDEA * GET THE USERS RECMOVIES INSTEAD
      // We call FUNCTION 2 for each member -> Pushing results to "groups_movies" container.
      const membersRecMovies = await fetchMovieJSON(member.id);
      membersRecMovies.forEach((movie) => {
        groups_movies.push(movie);
      });
    });
  });

  promise.then(() => {
    console.log([...groups_movies]);
    res.send([...groups_movies]);
    //return groups_movies;
  });

  // &&&&&&&&

  // Now we should have a list of all the members recommended movies i.e ->  groups_movies <-
  // LETS RETURN THIS LIST FOR NOW....

  //console.log(event_rec_movies);
  //res.send(event_rec_movies);
});

// ************* FUNCTION 1 ***************

// Argument: a 'LIST' of members in an event.
// Returns: a 'LIST' of recommended movies for the members of the event.

async function getRecommendations(arr) {}

// *********************************************

// ************* FUNCTION 2 ***************

// Argument: a 'LIST' of liked movies of the member.
// Returns: a 'LIST' of recommended movies for the member.

async function fetchMovieJSON(userId) {
  let usersMovies = usersStore.getMovies(userId);

  // If user had not liked any movies yet:
  if (usersMovies.length == 0) {
    usersMovies = [
      moviesStore.getMovieByTitle("Inception"),
      moviesStore.getMovieByTitle("Toy Story"),
    ];
  }
  const myJSON = JSON.stringify(usersMovies);

  const movies = await getRecForUser(myJSON);

  // Pick 6 random movies from the recommendation list
  let get_these_movies = [];

  const result = await pickSix(movies);

  async function pickSix(movies_list) {
    for (let i = 0; i < 6; i++) {
      var random_index = Math.floor(Math.random() * movies_list.length);
      var movie = movies_list[random_index];
      movies_list.splice(random_index, 1);
      get_these_movies.push(moviesStore.getMovieByTitle(movie));
    }
    return [...get_these_movies];
  }
  return result;
}

// ***************************************

// ************* FUNCTION 3 ***************

async function getRecForUser(movie_list) {
  var url = new URL("http://127.0.0.1:5000/helloworld");
  var params = { movies: movie_list };
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url);
  const recomended_movies = await response.json();
  return recomended_movies;
}

// ***************************************

module.exports = router;
