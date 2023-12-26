// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const Order = require('./models/Order');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/ZipZap', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

// Define a schema for client details
const clientSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
});

const Client = mongoose.model('Client', clientSchema);

const adminSchema = new mongoose.Schema({
  ID: String,
  passkey: String,
  role: String,
});

const Admin = mongoose.model('Admin', adminSchema);

// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// Signup endpoint
app.post('/signup', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if the username already exists
    const existingClient = await Client.findOne({ username });
    if (existingClient) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create a new client
    const newClient = new Client({
      username,
      password,
      role,
    });

    // Save the new client to the database
    await newClient.save();

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Signup endpoint for admins
app.post('/admin/signup', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Calculate ID and Passkey
    const x = 0.06295251241431114;
    const y = 25.15;
    const z = 82.58;

    const ID = Math.round((y - latitude) / x) + '#' + Math.round((longitude - z) / x);
    const passkey = 'Admin@123';

    // Check if the admin with the calculated ID already exists
    const existingAdmin = await Admin.findOne({ ID });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Shop already exists' });
    }

    // Create a new admin
    const newAdmin = new Admin({
      ID,
      passkey,
      role: 'admin',
    });

    // Save the new admin to the database
    await newAdmin.save();

    res.status(201).json({ message: 'Shop added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the client with the given username and password
    const client = await Client.findOne({ username, password });

    if (!client) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful', client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Use order routes
app.use('/api', orderRoutes);

app.post('/place-order', async (req, res) => {
  try {
    const { latitude, longitude, otherOrderDetails } = req.body;

    // Use the provided coordinates directly for the admin's location
    const adminLocation = { latitude, longitude };

    // Create a new collection for the admin if it doesn't exist
    const adminCollectionName = `admin_${adminLocation.latitude}_${adminLocation.longitude}`;
    const AdminCollection = mongoose.model(adminCollectionName, new mongoose.Schema({
      adminLocation: { latitude: Number, longitude: Number },
      ridersAvailable: { type: Number, default: 5 },
      orderDetails: [{
        // Schema for each order detail
        customerLocation: { latitude: Number, longitude: Number },
        ...otherOrderDetails,
      }],
    }));

    // Add the order details to the admin's collection
    const orderDetails = new AdminCollection({
      adminLocation,
      orderDetails: [{
        customerLocation: { latitude, longitude },
        ...otherOrderDetails,
      }],
    });

    // Save the order details to the admin's collection
    await orderDetails.save();

    // Create a new order
    const newOrder = new Order({
      customerLocation: { latitude, longitude },
      otherOrderDetails,
    });

    // Save the new order to the database
    const savedOrder = await newOrder.save();

    res.status(200).json({ message: 'Order placed successfully', order: savedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});