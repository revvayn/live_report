const express = require("express");
const controller = require("../controllers/entryReject.controller");

const router = express.Router();

router.get("/", controller.getAll);
router.post("/", controller.create);
router.post("/import", controller.importExcel);
router.delete("/clear", controller.clearAll);

module.exports = router;
