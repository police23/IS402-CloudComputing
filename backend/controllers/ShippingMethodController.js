const ShippingMethodService = require("../services/ShippingMethodService");
const getAllShippingMethods = async (req, res) => {
    try {
        const ShippingMethods = await ShippingMethodService.getAllShippingMethods();
        res.json(ShippingMethods);
    }
    catch (error) {
        res.status(500).json({error : "Không thể lấy phương thức vận chuyển"});
        
    }
};
module.exports = {
    getAllShippingMethods,
}

