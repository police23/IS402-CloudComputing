const bcrypt = require('bcrypt');
const { User } = require('../models');
const { Op } = require('sequelize');
const cacheHelper = require('../utils/cacheHelper');

const CACHE_KEYS = {
  ALL_USERS: 'users:all',
  ALL_SHIPPERS: 'users:shippers',
  USERS_BY_ROLE: (roleId) => `users:role:${roleId}`,
  USER_BY_ID: (id) => `users:${id}`,
};

const CACHE_TTL = {
  USERS_LIST: 1800,     // 30 minutes
  SHIPPERS_LIST: 1800,  // 30 minutes
  USER_DETAIL: 1200,    // 20 minutes
};

const getAllUsers = async () => {
  return await cacheHelper.getOrSet(
      CACHE_KEYS.ALL_USERS,
      async () => {
          return await User.findAll();
      },
      CACHE_TTL.USERS_LIST
  );
};

const getAllShippers = async () => {
  return await cacheHelper.getOrSet(
      CACHE_KEYS.ALL_SHIPPERS,
      async () => {
          return await User.findAll({ where: { role_id: 6, is_active: 1 } });
      },
      CACHE_TTL.SHIPPERS_LIST
  );
};

const getUsersByRole = async (role_id) => {
  return await cacheHelper.getOrSet(
      CACHE_KEYS.USERS_BY_ROLE(role_id),
      async () => {
          return await User.findAll({ where: { role_id } });
      },
      CACHE_TTL.USERS_LIST
  );
};

const getUserById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
};

const createUser = async (userData) => {
  const { username, fullName, email, phone, gender, password } = userData;
  if (!username || !fullName || !email || !phone || gender === undefined || gender === null || !password) {
    throw { status: 400, message: 'Vui lòng điền đầy đủ thông tin' };
  }
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  let role_id = 4;
  const is_active = 1;
  // Kiểm tra trùng username/email/phone
  const existed = await User.findOne({ where: { [Op.or]: [{ username }, { email }, { phone }] } });
  if (existed) {
    if (existed.username === username) throw { status: 409, message: 'Tên đăng nhập đã tồn tại' };
    if (existed.email === email) throw { status: 409, message: 'Email đã tồn tại' };
    if (existed.phone === phone) throw { status: 409, message: 'Số điện thoại đã tồn tại' };
    throw { status: 409, message: 'Thông tin đã tồn tại trong hệ thống' };
  }
  const user = await User.create({
    username,
    password: hashedPassword,
    full_name: fullName,
    email,
    phone,
    gender,
    role_id,
    is_active
  });
  return user;
};

const addUser = async (userData) => {
  const { username, fullName, email, phone, gender, role } = userData;
  if (!username || !fullName || !email || !phone || gender === undefined || gender === null || !role) {
    throw { status: 400, message: 'Vui lòng điền đầy đủ thông tin' };
  }
  const defaultPassword = '12345678';
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
  let role_id = typeof role === 'number' ? role : 2;
  if (typeof role === 'string') {
    switch (role) {
      case 'admin': role_id = 1; break;
      case 'sales': role_id = 2; break;
      case 'warehouse': role_id = 3; break;
      case 'order_manager': role_id = 5; break;
      case 'shipper': role_id = 6; break;
      default: role_id = 2;
    }
  }
  const is_active = 1;
  const existed = await User.findOne({ where: { [Op.or]: [{ username }, { email }, { phone }] } });
  if (existed) {
    if (existed.username === username) throw { status: 409, message: 'Tên đăng nhập đã tồn tại' };
    if (existed.email === email) throw { status: 409, message: 'Email đã tồn tại' };
    if (existed.phone === phone) throw { status: 409, message: 'Số điện thoại đã tồn tại' };
    throw { status: 409, message: 'Thông tin đã tồn tại trong hệ thống' };
  }
  const user = await User.create({
    username,
    password: hashedPassword,
    full_name: fullName,
    email,
    phone,
    gender,
    role_id,
    is_active
  });
  // Invalidate user caches
  await cacheHelper.delMany([CACHE_KEYS.ALL_USERS, CACHE_KEYS.ALL_SHIPPERS, CACHE_KEYS.USERS_BY_ROLE(role_id)]);
  return user;
};

const updateUser = async (id, userData) => {
  const { username, fullName, email, phone, gender, role, is_active, password } = userData;
  if (!username || !fullName || !email || !phone || gender === undefined || gender === null || !role) {
    throw { status: 400, message: 'Chưa nhập đầy đủ thông tin' };
  }
  let role_id = 2;
  if (typeof role === 'string') {
    switch (role) {
      case 'admin': role_id = 1; break;
      case 'sales': role_id = 2; break;
      case 'warehouse': role_id = 3; break;
      case 'order_manager': role_id = 5; break;
      case 'shipper': role_id = 6; break;
      default: role_id = 2;
    }
  } else if (typeof role === 'number') {
    role_id = role;
  }
  let genderValue = (gender === 'male' || gender === 0 || gender === '0') ? 0 : (gender === 'female' || gender === 1 || gender === '1') ? 1 : null;
  if (genderValue === null) throw { status: 400, message: 'Giới tính không hợp lệ' };
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'User not found' };
  // Kiểm tra trùng username/email/phone
  const existed = await User.findOne({
    where: {
      [Op.or]: [
        { username },
        { email },
        { phone }
      ],
      id: { [Op.ne]: id }
    }
  });
  if (existed) {
    if (existed.username === username) throw { status: 409, message: 'Tên đăng nhập đã tồn tại' };
    if (existed.email === email) throw { status: 409, message: 'Email đã tồn tại' };
    if (existed.phone === phone) throw { status: 409, message: 'Số điện thoại đã tồn tại' };
    throw { status: 409, message: 'Thông tin đã tồn tại trong hệ thống' };
  }
  let updateData = {
    username,
    full_name: fullName,
    email,
    phone,
    gender: genderValue,
    role_id,
    is_active: typeof is_active === 'undefined' ? 1 : is_active
  };
  if (password) {
    const saltRounds = 10;
    updateData.password = await bcrypt.hash(password, saltRounds);
  }
  await user.update(updateData);
  // Invalidate user caches
  await cacheHelper.delMany([CACHE_KEYS.ALL_USERS, CACHE_KEYS.ALL_SHIPPERS, CACHE_KEYS.USERS_BY_ROLE(user.role_id), CACHE_KEYS.USER_BY_ID(id)]);
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'User not found' };
  await user.destroy();
  // Invalidate user caches
  await cacheHelper.delMany([CACHE_KEYS.ALL_USERS, CACHE_KEYS.ALL_SHIPPERS, CACHE_KEYS.USERS_BY_ROLE(user.role_id), CACHE_KEYS.USER_BY_ID(id)]);
  return { message: 'User deleted successfully' };
};

const toggleAccountStatus = async (id, status) => {
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'User not found' };
  const is_active = status === 'active' ? 1 : 0;
  await user.update({ is_active });
  return user;
};

const changePassword = async (id, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) throw { status: 400, message: 'Current password and new password are required' };
  const user = await User.findByPk(id);
  if (!user) throw { status: 404, message: 'User not found' };
  const passwordMatches = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatches) throw { status: 401, message: 'Current password is incorrect' };
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  await user.update({ password: hashedPassword });
  return { message: 'Password updated successfully' };
};

module.exports = {
  getAllUsers,
  getAllShippers,
  getUsersByRole,
  getUserById,
  addUser,
  createUser,
  updateUser,
  deleteUser,
  toggleAccountStatus,
  changePassword
};
