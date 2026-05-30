const express = require("express");
const router = express.Router();

const surveyController = require("../controllers/surveyTitleController");

router.get("/", surveyController.getSurvey);
router.post("/", surveyController.createSurvey);
router.put("/:id", surveyController.updateSurvey);
router.delete("/:id", surveyController.deleteSurvey);

module.exports = router;
