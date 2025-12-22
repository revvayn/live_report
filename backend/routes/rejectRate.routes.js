const express = require("express");
const router = express.Router();
const controller = require("../controllers/rejectRate.controller");

router.get("/reject-by-machine", controller.getRejectByMachine);

module.exports = router;
