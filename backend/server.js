require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize all models and associations
require('./models');

const authRoutes = require('./routes/AuthRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');
const DamageReportRoutes = require('./routes/DamageReportRoutes');
const publisherRoutes = require('./routes/PublisherRoutes');
const supplierRoutes = require('./routes/SupplierRoutes'); 
const bookRoutes = require('./routes/bookRoutes'); 
const userRoutes = require('./routes/UserRoutes'); 
const rule = require('./routes/RuleRoutes'); 
const promotionRoutes = require('./routes/PromotionRoutes'); 
const importRoutes = require('./routes/ImportRoutes'); 
const cartRoutes = require('./routes/CartRoutes'); 
const addressRoutes = require('./routes/AddressRoutes'); 
const orderRoutes = require('./routes/OrderRoutes');
const shippingMethodRoutes = require('./routes/ShippingMethodRoutes');
const ratingRoutes = require('./routes/RatingRoutes');
const reportRoutes = require('./routes/ReportRoutes');
const app = express();
const PORT = process.env.PORT || 5000;
const paymentRoutes = require('./routes/PaymentRoutes');


app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/damage-reports', DamageReportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rules', rule);
app.use('/api/promotions', promotionRoutes); 
app.use('/api/imports', importRoutes);
app.use('/api/cart', cartRoutes); 
app.use('/api/orders', orderRoutes); 
app.use('/api/addresses', addressRoutes); 
app.use('/api/shipping-methods', shippingMethodRoutes); 
app.use('/api/ratings', ratingRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

app.get("/api-test", (req, res) => {
    res.json({ message: "API is working" });
});

app.get('/', (req, res) => {
    res.send('API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});