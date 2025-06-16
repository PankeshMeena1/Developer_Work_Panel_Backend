const Update = require('../models/Update');
const { validationResult } = require('express-validator');

// Get all updates with filtering and pagination
exports.getUpdates = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      tags, 
      dateFrom, 
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    // Execute query with pagination
    const updates = await Update.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Update.countDocuments(query);

    res.json({
      updates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single update
exports.getUpdate = async (req, res) => {
  try {
    const update = await Update.findById(req.params.id);
    
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }
    
    res.json(update);
  } catch (error) {
    console.error('Get update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new update
exports.createUpdate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const update = new Update(req.body);
    await update.save();
    
    res.status(201).json(update);
  } catch (error) {
    console.error('Create update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update existing update
exports.updateUpdate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const update = await Update.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }
    
    res.json(update);
  } catch (error) {
    console.error('Update update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete update
exports.deleteUpdate = async (req, res) => {
  try {
    const update = await Update.findByIdAndDelete(req.params.id);
    
    if (!update) {
      return res.status(404).json({ message: 'Update not found' });
    }
    
    res.json({ message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Delete update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const totalUpdates = await Update.countDocuments();
    const recentUpdates = await Update.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const tagStats = await Update.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const uniqueDays = await Update.distinct('date');
    
    res.json({
      totalUpdates,
      recentUpdates,
      uniqueDays: uniqueDays.length,
      tagStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
