const db = require("../db");

const getCartByUserID = async (UserID) => {
    const [cart] = await db.query(`
        SELECT id, c.user_id
        FROM carts c, users u
        JOIN users u ON c.user_id = u.id
        WHERE c.user_id = ?
    `, [UserID]);
    if (cart.length === 0) return null;
    const [details] = await db.query(`
        SELECT cart_id, b.book_id, quantity, b.price
        FROM carts c
        JOIN cart_details cd ON cd.cart_id = c.id
        JOIN books b ON b.id = cd.book_id
        WHERE c.user_id = ?
    `, [UserID]);
    return details;
}

const addToCart = async (userID, bookID, quantity) => {
    const [existingCart] = await db.query(
        'SELECT id FROM carts WHERE user_id = ?',
        [userID]
    );

    let cartID;
    if (existingCart.length === 0) {
        const [result] = await db.query(
            'INSERT INTO carts (user_id) VALUES (?)',
            [userID]
        );
        cartID = result.insertId;
    } else {
        cartID = existingCart[0].id;
    }
    
    const [existingItem] = await db.query(
        'SELECT quantity FROM cart_details WHERE cart_id = ? AND book_id = ?',
        [cartID, bookID]
    );

    if (existingItem.length > 0) {
        
        const newQuantity = existingItem[0].quantity + quantity;
        await db.query(
            'UPDATE cart_details SET quantity = ? WHERE cart_id = ? AND book_id = ?',
            [newQuantity, cartID, bookID]
        );
    } else {
        
        await db.query(
            'INSERT INTO cart_details (cart_id, book_id, quantity) VALUES (?, ?, ?)',
            [cartID, bookID, quantity]
        );
    }

    return { cartID, bookID, quantity };
};

const updateCartItemQuantity = async (userID, bookID, quantity) => {
    const [result] = await db.query(`
        UPDATE cart_details cd
        JOIN carts c ON cd.cart_id = c.id
        SET cd.quantity = ?
        WHERE c.user_id = ? AND cd.book_id = ?
    `, [quantity, userID, bookID]);

    return result.affectedRows > 0;
};

const removeFromCart = async (userID, bookID) => {
    const [result] = await db.query(`
        DELETE cd FROM cart_details cd
        JOIN carts c ON cd.cart_id = c.id
        WHERE c.user_id = ? AND cd.book_id = ?
    `, [userID, bookID]);

    return result.affectedRows > 0;
};


const getCartWithDetails = async (userID) => {
    const [cartItems] = await db.query(`
        SELECT 
            cd.cart_id as id,
            cd.book_id,
            cd.quantity,
            b.title,
            b.author,
            b.price,
            (
                SELECT image_path 
                FROM book_images 
                WHERE book_id = b.id 
                ORDER BY id ASC 
                LIMIT 1
            ) as image_path,
            b.quantity_in_stock as stock
        FROM cart_details cd
        JOIN carts c ON cd.cart_id = c.id
        JOIN books b ON cd.book_id = b.id
        WHERE c.user_id = ?
        ORDER BY cd.cart_id DESC
    `, [userID]);

    return cartItems;
};

module.exports = {
    getCartByUserID,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    getCartWithDetails
};