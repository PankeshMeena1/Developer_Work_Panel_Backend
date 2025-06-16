const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  tags: [{
    type: String,
    enum: ['code', 'meeting', 'blocker', 'review', 'planning', 'testing', 'deployment', 'research', 'documentation', 'bug-fix'],
    lowercase: true
  }],
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  time: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time format (HH:MM)']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'blocked', 'cancelled'],
    default: 'completed'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Remove required for now since we're not implementing auth
    // required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted date
updateSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Index for better query performance
updateSchema.index({ title: 'text', description: 'text' });
updateSchema.index({ date: -1 });
updateSchema.index({ tags: 1 });

module.exports = mongoose.model('Update', updateSchema);