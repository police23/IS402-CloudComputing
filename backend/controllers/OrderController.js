const OrderService = require('../services/OrderService');

const getOrdersByUserID = async (req, res) => {
    try {
        const userID = req.user.id;
        const orders = await OrderService.getOrdersByUserID(userID);
        res.json(orders);
    } catch (error) {
        console.error('Error in getOrdersByUserID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getOrdersByStatus = async (req, res) => {
    try {
        const status = getStatusFromRoute(req.path);
        const orders = await OrderService.getOrdersByStatus(status);
        res.json(orders);
    } catch (error) {
        console.error('Error in getOrdersByStatus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getOrdersByStatusAndUser = async (req, res) => {
    try {
        const userID = req.user.id;
        const status = getStatusFromRoute(req.path);
        const orders = await OrderService.getOrdersByStatusAndUser(status, userID);
        res.json(orders);
    } catch (error) {
        console.error('Error in getOrdersByStatusAndUser:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getOrdersByShipperID = async (req, res) => {
    try {
        const shipperID = req.user.id;
        const status = getStatusFromRoute(req.path);
        const orders = await OrderService.getOrdersByShipperID(shipperID, status);
        res.json(orders);
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

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const status = getStatusFromRoute(req.path);
        const result = await OrderService.updateOrderStatus(orderId, status);
        res.json(result);
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const assignOrderToShipper = async (req, res) => {
    try {
        console.log('[DEBUG] assignOrderToShipper params:', { params: req.params, body: req.body, user: req.user });
        const { orderId } = req.params;
        const { shipper_id } = req.body;
        const assignedBy = req.user?.id || null;
        const result = await OrderService.assignOrderToShipper(orderId, shipper_id, assignedBy);
        console.log('[DEBUG] assignOrderToShipper result:', result);
        res.json(result);
    } catch (error) {
        console.error('[DEBUG] assignOrderToShipper error:', error);
        res.status(500).json({ error: error.message || "Failed to assign order to shipper" });
    }
};

// Helper function to extract status from route path
const getStatusFromRoute = (path) => {
    if (path.includes('/processing')) return 'pending';
    if (path.includes('/confirmed')) return 'confirmed';
    if (path.includes('/delivering')) return 'delivering';
    if (path.includes('/delivered')) return 'delivered';
    if (path.includes('/cancelled')) return 'cancelled';
    return 'pending'; // default
};

module.exports = {
    getOrdersByUserID,
    getOrdersByStatus,
    getOrdersByStatusAndUser,
    getOrdersByShipperID,
    createOrder,
    updateOrderStatus,
    assignOrderToShipper
};