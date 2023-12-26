// /backend/src/models/DarkStore.js
const mongoose = require('mongoose');

const darkStoreSchema = new mongoose.Schema({
  name: String,
  location: { type: { lat: Number, lng: Number }, required: true },
  // Add other fields as needed
});

const DarkStore = mongoose.model('DarkStore', darkStoreSchema);

module.exports = DarkStore;


