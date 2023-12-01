const mongoose = require('mongoose');

const discountSchema = mongoose.Schema({
  PID: {
    type: String,
    trim: true, // space 없애줌
    unique: 1, // 유일
    required: true,
  },
  name: {
    type: String,
    maxLength: 20,
    required: true,
    trim: true,
  },
  discount: {
    type: Number,
    maxLength:2,
    required: true,
  },
  date: {
    type: Date,
    expires:0,
    required: true,
  },
  
});

const Discount = mongoose.model('discount', discountSchema);

module.exports = { Discount };
