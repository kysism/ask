const router = require("express").Router();
const controller = require("../controllers/surveyResultController");

/* =========================
   기존 (통계)
========================= */
router.get("/", controller.getResultBySurvey);

/* =========================
   신규 (응답자 상세)
========================= */
router.get("/detail", controller.getResultDetailByRespondent);

module.exports = router;
