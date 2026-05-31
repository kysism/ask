const express = require("express");
const router = express.Router();

const controller = require("../controllers/surveyController");

// TITLE
router.get("/title", controller.getTitle);

// ITEMS
router.get("/items", controller.getItems);

// CHECK DUPLICATE
router.get("/check", controller.checkDuplicate);

// SUBMIT
router.post("/submit", controller.submitSurvey);

module.exports = router;
