const express = require("express");
const router = express.Router();
const Joi = require("joi");
const multer = require("multer");

const store = require("../store/events");
const categoriesStore = require("../store/categories");
const validateWith = require("../middleware/validation");
const auth = require("../middleware/auth");
const imageResize = require("../middleware/imageResize");
const delay = require("../middleware/delay");
const eventMapper = require("../mappers/events");
const config = require("config");

const upload = multer({
  dest: "uploads/",
  limits: { fieldSize: 25 * 1024 * 1024 },
});

const schema = {
  title: Joi.string().required(),
  description: Joi.string().allow(""),
  time: Joi.number().required().min(1),
  categoryId: Joi.number().required().min(1),
  userId: Joi.string().required().min(1),
  location: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).optional(),
};

const validateCategoryId = (req, res, next) => {
  if (!categoriesStore.getCategory(parseInt(req.body.categoryId)))
    return res.status(400).send({ error: "Invalid categoryId." });

  next();
};

router.get("/", (req, res) => {
  const events = store.getEvents();
  const resources = events.map(eventMapper);
  res.send(resources);
});

router.post(
  "/",
  [
    // Order of these middleware matters.
    // "upload" should come before other "validate" because we have to handle
    // multi-part form data. Once the upload middleware from multer applied,
    // request.body will be populated and we can validate it. This means
    // if the request is invalid, we'll end up with one or more image files
    // stored in the uploads folder. We'll need to clean up this folder
    // using a separate process.
    // auth,
    upload.array("images", config.get("maxImageCount")),
    validateWith(schema),
    validateCategoryId,
    imageResize,
  ],

  async (req, res) => {
    const event = {
      title: req.body.title,
      time: parseFloat(req.body.time),
      categoryId: parseInt(req.body.categoryId),
      description: req.body.description,
      members: [],
      userId: req.body.userId,
    };
    event.images = req.images.map((fileName) => ({ fileName: fileName }));
    if (req.body.location) event.location = JSON.parse(req.body.location);
    if (req.user) event.userId = req.user.userId;

    store.addEvent(event);

    res.status(201).send(event);
  }
);

module.exports = router;
