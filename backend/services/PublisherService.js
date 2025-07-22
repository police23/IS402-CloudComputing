const publisherModel = require("../models/PublisherModel");

const getAllPublishers = async () => {
    return await publisherModel.getAllPublishers();
};


module.exports = {
    getAllPublishers,
};
