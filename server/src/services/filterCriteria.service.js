const contentTypeModel = require("../models/contentType.model");

async function getAllFilterCriteria(req) {
    const contentTypes = await contentTypeModel.find();
    return {
        status: contentTypes ? 200 : 404,
        json: {contentTypes: contentTypes, mediaTypes: []}
    }
}

module.exports = {
  getAllFilterCriteria
};