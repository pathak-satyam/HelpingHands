// controllers/volunteerController.js
const Task = require('../models/Task');
const { taskEvents, EVENT_TYPES } = require('../utils/observer');

// Show tasks available for volunteering (T3)
exports.showAvailableTasks = async (req, res) => {
  console.log('Show Available tasks')
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    
    // Get tasks where the user is not already a volunteer
    const availableTasks = await Task.find({ 
      volunteers: { $ne: req.session.user.email },
      status: { $ne: 'completed' }
    });
    
    res.render('volunteer/dashboard', { tasks: availableTasks });
  } catch (err) {
    res.status(500).send('Error fetching available tasks: ' + err.message);
  }
};

// Volunteer for a task (T4)
exports.volunteerForTask = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    
    const taskId = req.params.id;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).send('Task not found');
    }
    
    // Check if already volunteered
    if (task.volunteers.includes(req.session.user.email)) {
      return res.status(400).send('You have already volunteered for this task');
    }
    
    // Add volunteer to task
    task.volunteers.push(req.session.user.email);
    await task.save();
    
    // Emit volunteer joined event
    taskEvents.emit(EVENT_TYPES.VOLUNTEER_JOINED, { 
      task, 
      volunteerEmail: req.session.user.email 
    });
    
    res.redirect('/volunteer/my-tasks');
  } catch (err) {
    res.status(500).send('Error volunteering for task: ' + err.message);
  }
};

// Show tasks user has volunteered for
exports.showMyTasks = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    
    const myTasks = await Task.find({ 
      volunteers: req.session.user.email 
    });
    
    res.render('volunteer/my-tasks', { tasks: myTasks });
  } catch (err) {
    res.status(500).send('Error fetching your tasks: ' + err.message);
  }
};

exports.withdraw = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const taskId = req.params.id;
    const userEmail = req.session.user.email;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send('Task not found');
    }

    // Remove the email from volunteers array
    task.volunteers = task.volunteers.filter(email => email !== userEmail);
    await task.save();

    res.redirect('/volunteer/my-tasks');
  } catch (err) {
    console.error('❌ Error withdrawing from task:', err);
    res.status(500).send('Error withdrawing from task: ' + err.message);
  }
}