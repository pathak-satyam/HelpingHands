// models/Task.js
const mongoose = require('mongoose');
const { taskEvents, EVENT_TYPES } = require('../utils/observer');

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  ownerEmail: { 
    type: String, 
    required: true 
  },
  volunteers: [{ 
    type: String 
  }], // Array of volunteer emails
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'completed'], 
    default: 'open' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Implementing Observer pattern with Mongoose middleware
taskSchema.post('save', function(doc) {
  // Check what changed to emit the appropriate event
  if (this.isNew) {
    taskEvents.emit(EVENT_TYPES.TASK_CREATED, doc);
  } else {
    // For volunteer changes, we need to manually track this in the controller
    // as we don't have access to what specifically changed here
  }
});

// Static method to get statistics
taskSchema.statics.getStatistics = async function() {
  const tasks = await this.find();
  const totalTasks = tasks.length;
  
  // Count total volunteers across all tasks (may contain duplicates)
  const totalVolunteersWithDuplicates = tasks.reduce(
    (sum, task) => sum + task.volunteers.length, 0
  );
  
  // Count unique volunteers across all tasks
  const uniqueVolunteers = new Set();
  tasks.forEach(task => {
    task.volunteers.forEach(volunteer => uniqueVolunteers.add(volunteer));
  });
  
  return {
    totalTasks,
    totalVolunteersWithDuplicates,
    uniqueVolunteers: uniqueVolunteers.size,
    averageVolunteersPerTask: totalTasks > 0 ? 
      (totalVolunteersWithDuplicates / totalTasks).toFixed(1) : 0
  };
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;