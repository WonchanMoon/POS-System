const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  ID: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, maxLength: 30, required: true},
  role: { type: String, maxLength: 30, required: true},
  storeName: { type: String, maxLength: 30, required: true}
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
