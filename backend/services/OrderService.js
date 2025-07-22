const OrderModel = require('../models/OrderModel');

const getOrdersByUserID = async (userID) => {
    return await OrderModel.getOrdersByUserID(userID);
};

const getOrdersByStatus = async (status) => {
    return await OrderModel.getOrdersByStatus(status);
};

const getOrdersByStatusAndUser = async (status, userID) => {
    return await OrderModel.getOrdersByStatusAndUser(status, userID);
};

const getOrdersByShipperID = async (shipperID, status) => {
    return await OrderModel.getOrdersByShipperID(shipperID, status);
};

const getAllOrdersByStatus = async (status) => {
    return await OrderModel.getAllOrdersByStatus(status);
};

const createOrder = async (orderData) => {
    return await OrderModel.createOrder(orderData);
};

const updateOrderStatus = async (orderId, status) => {
    return await OrderModel.updateOrderStatus(orderId, status);
};

const assignOrderToShipper = async (orderId, shipperId, assignedBy) => {
    console.log('[DEBUG] OrderService.assignOrderToShipper params:', { orderId, shipperId, assignedBy });
    try {
        const result = await OrderModel.assignOrderToShipper(orderId, shipperId, assignedBy);
        console.log('[DEBUG] OrderService.assignOrderToShipper result:', result);
        return result;
    } catch (error) {
        console.error('[DEBUG] OrderService.assignOrderToShipper error:', error);
        throw error;
    }
};

// Special function for complete order (includes completion date update)
const completeOrder = async (orderId) => {
    const result = await OrderModel.updateOrderStatus(orderId, 'delivered');
    // Update completion date in order_assignments
    await OrderModel.updateCompletionDate(orderId);
    return result;
};

module.exports = {
    getOrdersByUserID,
    getOrdersByStatus,
    getOrdersByStatusAndUser,
    getOrdersByShipperID,
    getAllOrdersByStatus,
    createOrder,
    updateOrderStatus,
    completeOrder,
    assignOrderToShipper
};
