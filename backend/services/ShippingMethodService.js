const ShippingMethodModel = require("../models/ShippingMethodModel");
const getAllShippingMethods = async () => {
    return await ShippingMethodModel.getAllShippingMethods();
}
module.exports = {
    getAllShippingMethods,
}