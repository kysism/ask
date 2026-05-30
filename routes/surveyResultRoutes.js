const router = require("express").Router();
const controller = require("../controllers/surveyResultController");

router.get("/", controller.getResultBySurvey);

module.exports = router;
