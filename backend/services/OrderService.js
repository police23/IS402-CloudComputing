const { sequelize, Order, OrderDetail, OrderAssignment, User, ShippingMethod, Book } = require('../models');
const { Op } = require('sequelize');

const getOrdersByUserID = async (userID, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Order.findAndCountAll({
    where: { user_id: userID },
    include: [
      { model: ShippingMethod, as: 'shippingMethod', attributes: ['name'] },
      { model: OrderDetail, as: 'details', include: [{ model: Book, attributes: ['id', 'title', 'author'] }] }
    ],
    order: [['order_date', 'DESC']],
    limit: pageSize,
    offset
  });
  return { orders: rows, total: count };
};

const getAllOrdersByStatus = async (status, page = 1, pageSize = 10) => {
  const dbStatus = status === 'processing' ? 'pending' : status;
  const offset = (page - 1) * pageSize;
  const include = [
    { model: ShippingMethod, as: 'shippingMethod', attributes: ['name'] },
    { model: User, as: 'user', attributes: ['full_name', 'phone'] },
    { model: OrderDetail, as: 'details', include: [{ model: Book, attributes: ['id', 'title', 'author'] }] }
  ];
  if (dbStatus === 'delivering') {
    include.push({
      model: OrderAssignment, as: 'assignment',
      include: [{ model: User, as: 'shipper', attributes: ['full_name'] }]
    });
  }
  const { count, rows } = await Order.findAndCountAll({
    where: { status: dbStatus },
    include,
    order: [['order_date', 'DESC']],
    limit: pageSize,
    offset
  });
  return { orders: rows, total: count };
};

const getOrdersByStatusAndUser = async (status, userID, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Order.findAndCountAll({
    where: { status, user_id: userID },
    include: [
      { model: ShippingMethod, as: 'shippingMethod', attributes: ['name'] },
      { model: OrderDetail, as: 'details', include: [{ model: Book, attributes: ['id', 'title', 'author'] }] }
    ],
    order: [['order_date', 'DESC']],
    limit: pageSize,
    offset
  });
  return { orders: rows, total: count };
};

const getOrdersByShipperID = async (shipperID, status, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await Order.findAndCountAll({
    where: { status },
    include: [
      { model: ShippingMethod, as: 'shippingMethod', attributes: ['name'] },
      { model: User, as: 'user', attributes: ['full_name', 'phone'] },
      { model: OrderDetail, as: 'details', include: [{ model: Book, attributes: ['title', 'author'] }] },
      { model: OrderAssignment, as: 'assignment', where: { shipper_id: shipperID }, attributes: ['completion_date'] }
    ],
    order: [['order_date', 'DESC']],
    limit: pageSize,
    offset
  });
  return { orders: rows, total: count };
};

const createOrder = async (orderData) => {
  const { userID, shipping_method_id, shipping_address, promotion_code, total_amount,
    shipping_fee, discount_amount, final_amount, payment_method, orderDetails } = orderData;

  return await sequelize.transaction(async (t) => {
    // Tạo đơn hàng
    const order = await Order.create({
      user_id: userID,
      order_date: new Date(),
      shipping_method_id,
      shipping_address,
      promotion_code: promotion_code || null,
      total_amount,
      shipping_fee,
      discount_amount,
      final_amount,
      payment_method,
      status: 'pending'
    }, { transaction: t });

    // Kiểm tra tồn kho và tạo chi tiết đơn – đồng thời trừ tồn kho
    for (const detail of orderDetails) {
      const book = await Book.findByPk(detail.book_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!book) throw new Error(`Book ${detail.book_id} not found`);
      const currentStock = Number(book.quantity_in_stock) || 0;
      const qty = Number(detail.quantity) || 0;
      if (qty <= 0) throw new Error('Invalid order quantity');
      if (currentStock < qty) {
        throw new Error(`Số lượng tồn không đủ cho sách "${book.title}". Còn ${currentStock}, đặt ${qty}.`);
      }

      // Trừ tồn kho
      book.quantity_in_stock = currentStock - qty;
      await book.save({ transaction: t });

      // Lưu chi tiết đơn
      await OrderDetail.create({
        order_id: order.id,
        book_id: detail.book_id,
        quantity: qty,
        unit_price: detail.unit_price
      }, { transaction: t });
    }

    return order;
  });
};

const confirmOrder = async (orderId) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error("Order not found");
  order.status = 'confirmed';
  await order.save();
  return order;
};

const completeOrder = async (orderId) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error("Order not found");
  order.status = 'delivered';
  await order.save();
  
  const assignment = await OrderAssignment.findOne({ where: { order_id: orderId } });
  if (assignment) {
    assignment.completion_date = new Date();
    await assignment.save();
  }
  
  return { order, assignment };
};

const cancelOrder = async (orderId) => {
  return await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) throw new Error("Order not found");

    // Nếu đã hủy rồi thì không cộng tồn kho lần nữa (idempotent)
    if (order.status === 'cancelled') {
      return { success: true, message: 'Đơn hàng đã ở trạng thái hủy' };
    }

    // Chỉ khôi phục tồn kho nếu đơn chưa giao/hoàn tất
    if (['delivered', 'completed'].includes(order.status)) {
      order.status = 'cancelled';
      await order.save({ transaction: t });
      return { success: true, message: 'Đơn đã hoàn tất, chuyển trạng thái hủy (không hoàn kho)' };
    }

    // Lấy chi tiết đơn để hoàn kho
    const details = await OrderDetail.findAll({ where: { order_id: orderId } , transaction: t});
    for (const d of details) {
      const book = await Book.findByPk(d.book_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (book) {
        const currentStock = Number(book.quantity_in_stock) || 0;
        const qty = Number(d.quantity) || 0;
        book.quantity_in_stock = currentStock + qty;
        await book.save({ transaction: t });
      }
    }

    order.status = 'cancelled';
    await order.save({ transaction: t });
    return { success: true, message: 'Đơn hàng đã được hủy và tồn kho đã được khôi phục' };
  });
};

const assignOrderToShipper = async (orderId, shipperId, assignedBy) => {
  if (!orderId || !shipperId || !assignedBy) {
    throw new Error('Thiếu thông tin orderId, shipperId hoặc assignedBy');
  }
  
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error("Order not found");
  
  order.status = 'delivering';
  await order.save();
  
  await OrderAssignment.create({
    order_id: orderId,
    assigned_by: assignedBy,
    shipper_id: shipperId,
    assigned_at: new Date(),
    completion_date: null
  });
  
  return order;
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
