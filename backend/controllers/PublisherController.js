const publisherService = require("../services/publisherService");

const getAllPublishers = async (req, res) => {
    try {
        const publishers = await publisherService.getAllPublishers();
        res.json({ success: true, data: publishers });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch publishers" });
    }
};
module.exports = {
    getAllPublishers
};
