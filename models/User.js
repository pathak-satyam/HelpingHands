const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  zipCode: { type: String, required: true },
  accountType: { type: String, enum: ['requester', 'volunteer'], required: true },
 
});


module.exports = mongoose.model('User', userSchema);
