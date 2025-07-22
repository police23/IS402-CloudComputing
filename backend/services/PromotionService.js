const promotionModel = require("../models/PromotionModel");
const db = require("../db");

const getAllPromotions = async () => {
    return await promotionModel.getAllPromotions();
};

const getAvailablePromotions = async (total_price) => {
    return await promotionModel.getAvailablePromotions(total_price);
};

const addPromotion = async (promotionData) => {
 
    return await promotionModel.addPromotion(promotionData);
};

const updatePromotion = async (promotionData) => {
    return await promotionModel.updatePromotion(promotionData);
};

const deletePromotion = async (id) => {
    return result = await promotionModel.deletePromotion(id);

};

module.exports = {
    getAllPromotions,
    getAvailablePromotions,
    addPromotion,
    updatePromotion,
    deletePromotion
};
