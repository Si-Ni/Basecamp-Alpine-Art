const contactServices = require("../services/contact.services");

async function handleRequest(handler, req, res, next) {
  try {
    const result = await handler(req);
    const { status, json } = result;
    res.status(status).json(json);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    next(err);
  }
}

module.exports = {
  sendContactMessage: async (req, res, next) =>
    await handleRequest(contactServices.sendContactMessage, req, res, next),
};