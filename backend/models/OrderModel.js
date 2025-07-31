const db = require("../db");


const getOrdersByUserID = async (userID, page = 1, pageSize = 10) => {
    const offset = (page - 1) * pageSize;
    const [[{ total }]] = await db.query(
        `SELECT COUNT(*) as total FROM orders WHERE user_id = ?`,
        [userID]
    );
    const [orders] = await db.query(
        `SELECT o.*, s.name AS shipping_method_name
         FROM orders o
         JOIN shipping_methods s ON s.id = o.shipping_method_id
         WHERE o.user_id = ?
         ORDER BY o.order_date DESC
         LIMIT ? OFFSET ?`,
        [userID, pageSize, offset]
    );
    if (orders.length === 0) return { orders: [], total };
    const orderIds = orders.map(o => o.id);
    const [details] = await db.query(
        `SELECT od.id, od.order_id, b.id as book_id, b.title, b.author, od.quantity, od.unit_price
         FROM order_details od
         JOIN books b ON b.id = od.book_id
         WHERE od.order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
    );
    const detailsByOrderId = {};
    for (const detail of details) {
        if (!detailsByOrderId[detail.order_id]) detailsByOrderId[detail.order_id] = [];
        detailsByOrderId[detail.order_id].push(detail);
    }
    for (const order of orders) {
        order.orderDetails = detailsByOrderId[order.id] || [];
    }
    return { orders, total };
};


const getAllOrdersByStatus = async (status, page = 1, pageSize = 10) => {
    // Map 'processing' status từ FE sang 'pending' trong DB
    const dbStatus = status === 'processing' ? 'pending' : status;
    const offset = (page - 1) * pageSize;
    const [[{ total }]] = await db.query(
        `SELECT COUNT(*) as total FROM orders WHERE status = ?`,
        [dbStatus]
    );
    const [orders] = await db.query(
        `SELECT o.*, s.name AS shipping_method_name, u.full_name, u.phone
         FROM orders o
         JOIN shipping_methods s ON s.id = o.shipping_method_id
         JOIN users u ON u.id = o.user_id
         WHERE o.status = ?
         ORDER BY o.order_date DESC
         LIMIT ? OFFSET ?`,
        [dbStatus, pageSize, offset]
    );
    if (orders.length === 0) return { orders: [], total };
    const orderIds = orders.map(o => o.id);
    const [details] = await db.query(
        `SELECT od.id, od.order_id, b.id as book_id, b.title, b.author, od.quantity, od.unit_price
         FROM order_details od
         JOIN books b ON b.id = od.book_id
         WHERE od.order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
    );

    const detailsByOrderId = {};
    for (const detail of details) {
        if (!detailsByOrderId[detail.order_id]) detailsByOrderId[detail.order_id] = [];
        detailsByOrderId[detail.order_id].push(detail);
    }
    for (const order of orders) {
        order.orderDetails = detailsByOrderId[order.id] || [];
    }

    return { orders, total };
};

const getOrdersByStatusAndUser = async (status, userID, page = 1, pageSize = 10) => {
    const offset = (page - 1) * pageSize;
    const [[{ total }]] = await db.query(
        `SELECT COUNT(*) as total FROM orders WHERE status = ? AND user_id = ?`,
        [status, userID]
    );
    const [orders] = await db.query(
        `SELECT o.*, s.name AS shipping_method_name
         FROM orders o
         JOIN shipping_methods s ON s.id = o.shipping_method_id
         WHERE o.status = ? AND o.user_id = ?
         ORDER BY o.order_date DESC
         LIMIT ? OFFSET ?`,
        [status, userID, pageSize, offset]
    );
    if (orders.length === 0) return { orders: [], total };
    const orderIds = orders.map(o => o.id);
    const [details] = await db.query(
        `SELECT od.id, od.order_id, b.id as book_id, b.title, b.author, od.quantity, od.unit_price
         FROM order_details od
         JOIN books b ON b.id = od.book_id
         WHERE od.order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
    );
    const detailsByOrderId = {};
    for (const detail of details) {
        if (!detailsByOrderId[detail.order_id]) detailsByOrderId[detail.order_id] = [];
        detailsByOrderId[detail.order_id].push(detail);
    }
    for (const order of orders) {
        order.orderDetails = detailsByOrderId[order.id] || [];
    }
    return { orders, total };
};


const getOrdersByShipperID = async (shipperID, status, page = 1, pageSize = 10) => {
    const offset = (page - 1) * pageSize;
    const [[{ total }]] = await db.query(
        `SELECT COUNT(*) as total
         FROM orders o
         JOIN order_assignments oa ON oa.order_id = o.id
         WHERE oa.shipper_id = ? AND o.status = ?`,
        [shipperID, status]
    );
    const [orders] = await db.query(
        `SELECT o.*, s.name AS shipping_method_name, u.full_name, u.phone, oa.completion_date
         FROM orders o
         JOIN shipping_methods s ON s.id = o.shipping_method_id
         JOIN order_assignments oa ON oa.order_id = o.id
         JOIN users u ON u.id = o.user_id
         WHERE oa.shipper_id = ? AND o.status = ?
         ORDER BY o.order_date DESC
         LIMIT ? OFFSET ?`,
        [shipperID, status, pageSize, offset]
    );
    if (orders.length === 0) return { orders: [], total };
    const orderIds = orders.map(o => o.id);
    const [details] = await db.query(
        `SELECT b.title, b.author, od.quantity, od.unit_price, od.order_id
         FROM order_details od
         JOIN books b ON b.id = od.book_id
         WHERE od.order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
    );
    const detailsByOrderId = {};
    for (const detail of details) {
        if (!detailsByOrderId[detail.order_id]) detailsByOrderId[detail.order_id] = [];
        detailsByOrderId[detail.order_id].push(detail);
    }
    for (const order of orders) {
        order.orderDetails = detailsByOrderId[order.id] || [];
    }
    return { orders, total };
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


const confirmOrder = async (orderId) => {
    const [result] = await db.query(
        `UPDATE orders SET status = 'confirmed' WHERE id = ?`,
        [orderId]
    );
    if (result.affectedRows === 0) {
        throw new Error("Order not found");
    }
    return result;
};

const completeOrder = async (orderId) => {
    const [orderResult] = await db.query(
        `UPDATE orders SET status = 'delivered' WHERE id = ?`,
        [orderId]
    );
    const [assignResult] = await db.query(
        `UPDATE order_assignments SET completion_date = NOW() WHERE order_id = ?`,
        [orderId]
    );
    return { orderResult, assignResult };
};

const assignOrderToShipper = async (orderId, shipperId, assignedBy) => {
    if (!orderId || !shipperId || !assignedBy) {
        console.error('assignOrderToShipper missing params:', { orderId, shipperId, assignedBy });
        throw new Error('Thiếu thông tin orderId, shipperId hoặc assignedBy');
    }
    try {
        const [result] = await db.query(
            `UPDATE orders SET status = 'delivering' WHERE id = ?`,
            [orderId]
        );
        await db.query(
            `INSERT INTO order_assignments (order_id, assigned_by, shipper_id, assigned_at, completion_date)
             VALUES (?, ?, ?, NOW(), NULL)`,
            [orderId, assignedBy, shipperId]
        );
        return result;
    } catch (error) {
        console.error('Error in assignOrderToShipper (OrderModel):', error);
        throw error;
    }
};



module.exports = {
    getAllOrdersByStatus,
    getOrdersByUserID,
    getOrdersByStatusAndUser,
    getOrdersByShipperID,
    createOrder,
    confirmOrder,
    completeOrder,
    assignOrderToShipper
};
