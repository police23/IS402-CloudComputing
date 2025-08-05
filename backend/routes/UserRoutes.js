
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/shippers', userController.getAllShippers);
router.get('/role/:role_id', userController.getUsersByRole);
router.post('/:id/change-password', userController.changePassword);
router.patch('/:id/status', userController.toggleAccountStatus);
router.get('/:id', userController.getUser);
router.get('/', userController.getAllUsers);
router.post('/', userController.addUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
