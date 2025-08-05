const { Publisher } = require("../models");

const getAllPublishers = async () => {
    return await Publisher.findAll();
};


module.exports = {
    getAllPublishers,
};
