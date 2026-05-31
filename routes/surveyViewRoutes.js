const express = require("express");
const router = express.Router();

const surveyViewController = require("../controllers/surveyViewController");

// =========================
// SURVEY TITLE
// =========================
router.get("/title", surveyViewController.getSurveyTitle);

// =========================
// SURVEY QUESTIONS
// =========================
router.get("/questions", surveyViewController.getSurveyQuestions);

// =========================
// CHECK DUPLICATE (IP)
// =========================
router.get("/duplicate", surveyViewController.checkDuplicate);

// =========================
// SUBMIT SURVEY
// =========================
router.post("/submit", surveyViewController.submitSurvey);

module.exports = router;
