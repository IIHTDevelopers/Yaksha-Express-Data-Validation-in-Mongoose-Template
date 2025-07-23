const mongoose = require('mongoose');

// Custom Validator for unique hotel name

// Hotel Schema definition
const hotelSchema = new mongoose.Schema();

// Create a Mongoose model based on the schema
const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
