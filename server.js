require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const connectDB = require('./src/config/database');
const errorMiddleware = require('./src/middleware/errorMiddleware');
const loggerMiddleware = require('./src/middleware/loggerMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');

connectDB();

const app = express();

app.use(loggerMiddleware);
app.use(helmet());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});