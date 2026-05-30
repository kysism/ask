const router = require("express").Router();
const auth = require("../controllers/authController");

router.post("/generate", auth.generatePassword);
router.post("/verify", auth.verifyPassword);
router.get("/verify-session", auth.verifySession);

module.exports = router;
