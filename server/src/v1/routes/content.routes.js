const router = require("express").Router();
const { getAllFilterCriteria } = require("../controllers/content.controllers");

/**
 * @route GET /content/allFilterCriteria
 * @group Content
 * @returns {Array.<object>} 200 - An array of content items
 * @returns {Error}  default - Unexpected error
 */
router.get("/allFilterCriteria", getAllFilterCriteria)

module.exports = router;
