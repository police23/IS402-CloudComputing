const OrderModel = require('../models/OrderModel');

const getOrdersByUserID = async (userID, page = 1, pageSize = 10) => {
    return await OrderModel.getOrdersByUserID(userID, page, pageSize);
};

const getAllOrdersByStatus = async (status, page = 1, pageSize = 10) => {
    return await OrderModel.getAllOrdersByStatus(status, page, pageSize);
};

const getOrdersByStatusAndUser = async (status, userID, page = 1, pageSize = 10) => {
    return await OrderModel.getOrdersByStatusAndUser(status, userID, page, pageSize);
};

const getOrdersByShipperID = async (shipperID, status, page = 1, pageSize = 10) => {
    return await OrderModel.getOrdersByShipperID(shipperID, status, page, pageSize);
};

const createOrder = async (orderData) => {
    return await OrderModel.createOrder(orderData);
};

const confirmOrder = async (orderId) => {
    return await OrderModel.confirmOrder(orderId);
};

const completeOrder = async (orderId) => {
    return await OrderModel.completeOrder(orderId);
};

const cancelOrder = async (orderId) => {
    return await OrderModel.cancelOrder(orderId);
};

const assignOrderToShipper = async (orderId, shipperId, assignedBy) => {
    try {
        const result = await OrderModel.assignOrderToShipper(orderId, shipperId, assignedBy);
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getOrdersByUserID,
    getAllOrdersByStatus,
    getOrdersByStatusAndUser,
    getOrdersByShipperID,
    createOrder,
    confirmOrder,
    completeOrder,
    cancelOrder,
    assignOrderToShipper
};
