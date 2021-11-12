const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please add a  name'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  status: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true,
  },
});

module.exports = mongoose.model('Post', PostSchema);
