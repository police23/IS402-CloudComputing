const db = require("../db");

const getOrdersByUserID = async (userID) => {
    const [orders] = await db.query(
        `SELECT o.*, s.name AS shipping_method_name FROM orders o
         JOIN shipping_methods s ON s.id = o.shipping_method_id
         WHERE o.user_id = ?`,
        [userID]
    );
    for (const ors of orders) {
        const [details] = await db.query(
            `SELECT od.id, b.id as book_id, b.title, b.author, quantity, unit_price
             FROM order_details od
             JOIN books b ON b.id = od.book_id
             WHERE order_id = ?`,
            [ors.id]
        );
        ors.orderDetails = details;
    }
    return orders;
};

const getOrdersByStatus = async (status) => {
    const [orders] = await db.query(
        `SELECT o.*, s.name AS shipping_method_name FROM orders o
         JOIN shipping_methods s ON s.id = o.shipping_method_id
         WHERE o.status = ?`,
        [status]
    );
    
    for (const ors of orders) {
        const [details] = await db.query(
            `SELECT od.id, b.id as book_id, b.title, b.author, quantity, unit_price
             FROM order_details od
             JOIN books b ON b.id = od.book_id
             WHERE order_id = ?`,
            [ors.id]
        );
        ors.orderDetails = details;
    }
    return orders;
};

const getOrdersByStatusAndUser = async (status, userID) => {
    const [orders] = await db.query(
        `SELECT o.*, s.name AS shipping_method_name FROM orders o
         JOIN shipping_methods s ON s.id = o.shipping_method_id
         WHERE o.status = ? AND o.user_id = ?`,
        [status, userID]
    );
    
    for (const ors of orders) {
        const [details] = await db.query(
            `SELECT od.id, b.id as book_id, b.title, b.author, quantity, unit_price
             FROM order_details od
             JOIN books b ON b.id = od.book_id
             WHERE order_id = ?`,
            [ors.id]
        );
        ors.orderDetails = details;
    }
    return orders;
};

const getAllOrdersByStatus = async (status) => {
    const [orders] = await db.query(
        `SELECT o.*, s.name AS shipping_method_name, u.full_name, u.phone
         FROM orders o
         JOIN shipping_methods s ON s.id = o.shipping_method_id
         JOIN users u ON u.id = o.user_id
         WHERE o.status = ?`,
        [status]
    );
    
    for (const order of orders) {
        const [details] = await db.query(
            `SELECT b.title, od.quantity, od.unit_price
             FROM order_details od
             JOIN books b ON b.id = od.book_id
             WHERE od.order_id = ?`, 
            [order.id]
        );
        order.orderDetails = details;
    }
    return orders;
};

const getOrdersByShipperID = async (shipperID, status) => {
    const [orders] = await db.query(
        `SELECT o.*, s.name AS shipping_method_name, u.full_name, u.phone, oa.completion_date FROM orders o
         JOIN shipping_methods s ON s.id = o.shipping_method_id
         JOIN order_assignments oa ON oa.order_id = o.id
         JOIN users u ON u.id = o.user_id
         WHERE oa.shipper_id = ? AND o.status = ?`,
        [shipperID, status]
    );
    
    for (const ors of orders) {
        const [details] = await db.query(
            `SELECT b.title, b.author, quantity, unit_price
             FROM order_details od
             JOIN books b ON b.id = od.book_id
             WHERE order_id = ?`,
            [ors.id]
        );
        ors.orderDetails = details;
    }
    return orders;
};

const createOrder = async (orderData) => {
    const { userID, shipping_method_id, shipping_address, promotion_code, total_amount,
        shipping_fee, discount_amount, final_amount, payment_method, orderDetails } = orderData;

    if (!promotion_code) promotion_code = null;
    const [result] = await db.query(
        `INSERT INTO orders (user_id, order_date, shipping_method_id, shipping_address, promotion_code, total_amount, shipping_fee, discount_amount, final_amount, payment_method, status)
         VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [userID, shipping_method_id, shipping_address, promotion_code, total_amount, shipping_fee, discount_amount, final_amount, payment_method]
    );
    const orderId = result.insertId;
    for (const detail of orderDetails) {
        const { book_id, quantity, unit_price } = detail;
        await db.query(
            `INSERT INTO order_details (order_id, book_id, quantity, unit_price)
             VALUES (?, ?, ?, ?)`,
            [orderId, book_id, quantity, unit_price]
        );
    }
    return result;
};

const updateOrderStatus = async (orderId, status) => {
    const [result] = await db.query(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, orderId]
    );
    if (result.affectedRows === 0) {
        throw new Error("Order not found");
    }
    return result;
};

const updateCompletionDate = async (orderId) => {
    const [result] = await db.query(
        `UPDATE order_assignments SET completion_date = NOW() WHERE order_id = ?`,
        [orderId]
    );
    return result;
};

const assignOrderToShipper = async (orderId, shipperId, assignedBy) => {
    const [result] = await db.query(
        `UPDATE orders SET status = 'delivering' WHERE id = ?`,
        [orderId]
    );
    if (result.affectedRows === 0) {
        throw new Error("Order not found or already assigned");
    }
    await db.query(
        `INSERT INTO order_assignments (order_id, assigned_by, shipper_id, assigned_at, completion_date)
         VALUES (?, ?, ?, NOW(), NULL)`,
        [orderId, assignedBy, shipperId]
    );
    return result;
};

module.exports = {
    getOrdersByUserID,
    getOrdersByStatus,
    getOrdersByStatusAndUser,
    getAllOrdersByStatus,
    getOrdersByShipperID,
    createOrder,
    updateOrderStatus,
    updateCompletionDate,
    assignOrderToShipper
};
