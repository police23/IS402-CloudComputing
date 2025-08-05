const ShippingMethodService = require("../services/ShippingMethodService");

const getAllShippingMethods = async (req, res) => {
  try {
    const shippingMethods = await ShippingMethodService.getAllShippingMethods();
    res.json({ success: true, data: shippingMethods });
  } catch (error) {
    res.status(500).json({ success: false, error: "Không thể lấy phương thức vận chuyển" });
  }
};

module.exports = {
  getAllShippingMethods,
};

