const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerLocation: {
    type: {
      latitude: Number,
      longitude: Number,
    },
  },
  // Other order details can be added here
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;