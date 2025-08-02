const OrderService = require('../services/OrderService');
const getOrdersByUserID = async (req, res) => {
    try {
        const userID = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const result = await OrderService.getOrdersByUserID(userID, page, pageSize);
        res.json(result);
    } catch (error) {
        console.error('Error in getOrdersByUserID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getAllOrdersByStatus = async (req, res) => {
    try {
        const status = getStatusFromRoute(req.path);
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const result = await OrderService.getAllOrdersByStatus(status, page, pageSize);
        res.json(result);
    } catch (error) {
        console.error('Error in getOrdersByStatus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getOrdersByStatusAndUser = async (req, res) => {
    try {
        const userID = req.user.id;
        const status = getStatusFromRoute(req.path);
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const result = await OrderService.getOrdersByStatusAndUser(status, userID, page, pageSize);
        res.json(result);
    } catch (error) {
        console.error('Error in getOrdersByStatusAndUser:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getOrdersByShipperID = async (req, res) => {
    try {
        const shipperID = req.user.id;
        const status = getStatusFromRoute(req.path);
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const result = await OrderService.getOrdersByShipperID(shipperID, status, page, pageSize);
        res.json(result);
    } catch (error) {
        console.error('Error in getOrdersByShipperID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createOrder = async (req, res) => {
    try {
        const userID = req.user.id;
        const orderData = {
            ...req.body,
            userID
        };
        const result = await OrderService.createOrder(orderData);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in createOrder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const confirmOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await OrderService.confirmOrder(orderId);
        res.json(result);
    } catch (error) {
        console.error('Error in confirmOrder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const completeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await OrderService.completeOrder(orderId);
        res.json(result);
    } catch (error) {
        console.error('Error in completeOrder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await OrderService.cancelOrder(orderId);
        res.json(result);
    } catch (error) {
        console.error('Error in cancelOrder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const assignOrderToShipper = async (req, res) => {
    try {
        
        const { orderId } = req.params;
        const { shipper_id } = req.body;
        const assignedBy = req.user?.id || null;
        const result = await OrderService.assignOrderToShipper(orderId, shipper_id, assignedBy);
      
        res.json(result);
    } catch (error) {
        
        res.status(500).json({ error: error.message || "Failed to assign order to shipper" });
    }
};

const getStatusFromRoute = (path) => {
    if (path.includes('/processing')) return 'pending';
    if (path.includes('/confirmed')) return 'confirmed';
    if (path.includes('/delivering')) return 'delivering';
    if (path.includes('/delivered')) return 'delivered';
    if (path.includes('/cancelled')) return 'cancelled';
    return 'pending'; 
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