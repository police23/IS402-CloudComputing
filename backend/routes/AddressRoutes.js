const express = require('express');
const router = express.Router();
const addressController = require('../controllers/AddressController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', addressController.getAddressesByUserID);
router.post('/', addressController.addAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.put('/:id/default', addressController.setDefaultAddress);
module.exports = router;
