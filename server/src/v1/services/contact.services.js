async function sendContactMessage(req) {
  try {
    const { name, email, subject, message } = req.body;

    return {
      status: 200,
    };
  } catch (error) {
    return {
      status: 500
    };
  }
}

module.exports = {
  sendContactMessage,
};
