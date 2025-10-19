const STORAGE_KEY = 'guest_cart_v1';

const safeParse = (str) => {
  try { return JSON.parse(str); } catch { return null; }
};

const read = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw);
  if (parsed && Array.isArray(parsed.items)) return parsed;
  return { items: [] };
};

const write = (cart) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: cart.items || [] }));
};

const add = (bookID, quantity = 1) => {
  const cart = read();
  const idx = cart.items.findIndex((i) => i.bookID === bookID);
  if (idx >= 0) {
    cart.items[idx].quantity = (cart.items[idx].quantity || 0) + quantity;
  } else {
    cart.items.push({ bookID, quantity });
  }
  write(cart);
  return cart;
};

const update = (bookID, quantity) => {
  const cart = read();
  const idx = cart.items.findIndex((i) => i.bookID === bookID);
  if (idx >= 0) {
    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }
  }
  write(cart);
  return cart;
};

const remove = (bookID) => {
  const cart = read();
  const next = { items: cart.items.filter((i) => i.bookID !== bookID) };
  write(next);
  return next;
};

const clear = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const getItems = () => read().items;

const countItems = () => getItems().length; // số dòng hàng, giống backend response.data.length

export default {
  add,
  update,
  remove,
  clear,
  getItems,
  countItems,
};
