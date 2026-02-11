const express = require("express");
const router = express.Router();
const { sendContactMessage } = require("../controllers/contact.controllers");

/**
 * @typedef ContactRequest
 * @property {string} name.required - Name of the sender
 * @property {string} email.required - Email of the sender
 * @property {string} subject - Subject of the message
 * @property {string} message.required - Message content
 */

/**
 * @route POST /contact
 * @group Contact
 * @param {ContactRequest.model} request.body.required - Contact message JSON
 * @returns {object} 200 - Success Message
 * @returns {object} 400 - Validation Error
 * @returns {Error}  default - Unexpected error
 */
router.post("/", sendContactMessage);

module.exports = router;