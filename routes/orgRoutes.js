const express = require("express");
const router = express.Router();

const orgController = require("../controllers/orgController");

router.get("/", orgController.getOrg);
router.post("/", orgController.createOrg);
router.put("/:id", orgController.updateOrg);
router.delete("/:id", orgController.deleteOrg);

module.exports = router;
