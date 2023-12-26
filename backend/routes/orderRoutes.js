// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');  // Adjust the path based on your project structure

// Create a new order
router.post('/orders', async (req, res) => {
  try {
    const { customerLocation, otherOrderDetails } = req.body;

    // Create a new order
    const newOrder = new Order({
      customerLocation,
      otherOrderDetails,
    });

    // Save the new order to the database
    const savedOrder = await newOrder.save();

    res.status(201).json({ message: 'Order placed successfully', order: savedOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add more routes as needed for order management (e.g., get all orders, update, delete)

module.exports = router;
