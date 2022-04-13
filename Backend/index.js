const express = require("express");
const categories = require("./routes/categories");
const events = require("./routes/events");
const event = require("./routes/event");
const users = require("./routes/users");
const user = require("./routes/user");
const group = require("./routes/group");
const auth = require("./routes/auth");
const members = require("./routes/members");
const movies = require("./routes/movies");
const movie = require("./routes/movie");
const my = require("./routes/my");
const messages = require("./routes/messages");
const expoPushTokens = require("./routes/expoPushTokens");
const helmet = require("helmet");
const compression = require("compression");
const config = require("config");
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(helmet());
app.use(compression());

app.use("/api/group", group);
app.use("/api/movie", movie);
app.use("/api/movies", movies);
app.use("/api/members", members);
app.use("/api/categories", categories);
app.use("/api/event", event);
app.use("/api/events", events);
app.use("/api/user", user);
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/my", my);
app.use("/api/expoPushTokens", expoPushTokens);
app.use("/api/messages", messages);

const port = process.env.PORT || config.get("port");
app.listen(port, function () {
  console.log(`Server started on port ${port}...`);
});
