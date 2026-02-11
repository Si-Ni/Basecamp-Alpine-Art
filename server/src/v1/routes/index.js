const router = require("express").Router();

router.use("/contact", require("./contact.routes"));
router.use("/content", require("./content.routes"));
// router.use("/auth", require("./auth.routes"));

module.exports = router;
