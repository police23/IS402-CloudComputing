
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// IMPORTANT: Most specific routes should come before generic routes
// Route for getting all users with /all path (specific path)
router.get('/all', userController.getAllUsers);
// Route for getting all shippers
router.get('/shippers', userController.getAllShippers);
// Route for getting users by role
router.get('/role/:role_id', userController.getUsersByRole);
// Route for changing password
router.post('/:id/change-password', userController.changePassword);

// Route for toggling account status
router.patch('/:id/status', userController.toggleAccountStatus);

// Route to get a single user by ID
router.get('/:id', userController.getUser);

// Generic routes
router.get('/', userController.getAllUsers);
router.post('/', userController.addUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
