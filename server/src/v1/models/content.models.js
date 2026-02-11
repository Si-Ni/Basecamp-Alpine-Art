const mongoose = require("mongoose");

const contentTypeModel = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
});

module.exports = mongoose.model("ContentType", contentTypeModel, "content_types");