// Import tất cả models
const sequelize = require('../db');

// Basic models
const Role = require('./RoleModel');
const User = require('./UserModel');
const Category = require('./CategoryModel');
const Publisher = require('./PublisherModel');
const Book = require('./BookModel');
const BookImages = require('./BookImagesModel');
const Address = require('./AddressModel');
const Supplier = require('./SupplierModel');
const Promotion = require('./PromotionModel');
const { PromotionDetail } = require('./PromotionDetailModel');
const ShippingMethod = require('./ShippingMethodModel');
const Rule = require('./RuleModel');

// Import models
const { BookImport } = require('./ImportModel');
const { ImportDetail } = require('./ImportDetailModel');

// Order models
const { Order } = require('./OrderModel');
const { OrderDetail } = require('./OrderDetailModel');
const { OrderAssignment } = require('./OrderAssignmentModel');

// Rating model
const { Rating } = require('./RatingModel');

// Damage Report models
const { DamageReport } = require('./DamageReportModel');
const { DamageReportItem } = require('./DamageReportItemsModel');
// Cart models
const { Cart } = require('./CartModel');
const { CartDetail } = require('./CartDetailModel');

// =================
// DEFINE ASSOCIATIONS
// =================

// User associations
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

// Address associations
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });

// Book associations
Book.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Book.belongsTo(Publisher, { foreignKey: 'publisher_id', as: 'publisher' });
Book.hasMany(BookImages, { foreignKey: 'book_id', as: 'images' });
Category.hasMany(Book, { foreignKey: 'category_id', as: 'books' });
Publisher.hasMany(Book, { foreignKey: 'publisher_id', as: 'books' });
BookImages.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

// Import associations
BookImport.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
BookImport.belongsTo(User, { foreignKey: 'imported_by', as: 'employee' });
BookImport.hasMany(ImportDetail, { foreignKey: 'import_id', as: 'details', onDelete: 'CASCADE' });
ImportDetail.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

Supplier.hasMany(BookImport, { foreignKey: 'supplier_id', as: 'imports' });
User.hasMany(BookImport, { foreignKey: 'imported_by', as: 'imports' });

// Order associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
Order.belongsTo(ShippingMethod, { foreignKey: 'shipping_method_id', as: 'shippingMethod', onDelete: 'SET NULL' });
// Note: Previous association via promotion_code removed due to schema change
Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'details', onDelete: 'CASCADE' });
Order.hasOne(OrderAssignment, { foreignKey: 'order_id', as: 'assignment', onDelete: 'CASCADE' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
ShippingMethod.hasMany(Order, { foreignKey: 'shipping_method_id', as: 'orders' });
// Note: Previous association via promotion_code removed due to schema change

// Order Detail associations
OrderDetail.belongsTo(Order, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderDetail.belongsTo(Book, { foreignKey: 'book_id' });
Book.hasMany(OrderDetail, { foreignKey: 'book_id', as: 'orderDetails' });

// Order Assignment associations
OrderAssignment.belongsTo(Order, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderAssignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedBy', onDelete: 'SET NULL' });
OrderAssignment.belongsTo(User, { foreignKey: 'shipper_id', as: 'shipper', onDelete: 'SET NULL' });

User.hasMany(OrderAssignment, { foreignKey: 'assigned_by', as: 'assignedOrders' });
User.hasMany(OrderAssignment, { foreignKey: 'shipper_id', as: 'shippedOrders' });

// Rating associations
Rating.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Rating.belongsTo(Book, { foreignKey: 'book_id', onDelete: 'CASCADE' });

User.hasMany(Rating, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Book.hasMany(Rating, { foreignKey: 'book_id', onDelete: 'CASCADE' });

// Damage Report associations
DamageReport.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
DamageReport.hasMany(DamageReportItem, { foreignKey: 'report_id', as: 'items', onDelete: 'CASCADE' });

User.hasMany(DamageReport, { foreignKey: 'created_by', as: 'damageReports' });

// Damage Report Item associations
DamageReportItem.belongsTo(DamageReport, { foreignKey: 'report_id', onDelete: 'CASCADE' });
DamageReportItem.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });
Book.hasMany(DamageReportItem, { foreignKey: 'book_id', as: 'damageReportItems' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });

Cart.hasMany(CartDetail, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' });
CartDetail.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart', onDelete: 'CASCADE' });

CartDetail.belongsTo(Book, { foreignKey: 'book_id', as: 'Book', onDelete: 'CASCADE' });
Book.hasMany(CartDetail, { foreignKey: 'book_id', as: 'cartItems' });

// Promotion associations (many-to-many with Book via promotion_details)
Promotion.belongsToMany(Book, {
  through: PromotionDetail,
  foreignKey: 'promotion_id',
  otherKey: 'book_id',
  as: 'books',
});
Book.belongsToMany(Promotion, {
  through: PromotionDetail,
  foreignKey: 'book_id',
  otherKey: 'promotion_id',
  as: 'promotions',
});

// =================
// EXPORT ALL MODELS
// =================
module.exports = {
  sequelize,
  Role,
  User,
  Category,
  Publisher,
  Book,
  BookImages,
  Address,
  Supplier,
  Promotion,
  ShippingMethod,
  Rule,
  PromotionDetail,
  BookImport,
  Order,
  OrderDetail,
  OrderAssignment,
  Rating,
  DamageReport,
  DamageReportItem,
  Cart,
  CartDetail
};
