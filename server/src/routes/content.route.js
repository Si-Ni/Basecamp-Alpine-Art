const express = require("express");
const router = express.Router();
const { getAllFilterCriteria } = require("../controllers/content.controller");

router.get("/api/v1.0/allFilterCriteria", getAllFilterCriteria);

module.exports = router;