// controllers/taskController.js
const Task = require('../models/Task');
const { taskEvents, EVENT_TYPES } = require('../utils/observer');

// Show task creation form
exports.showCreateTask = (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('requester/create');
};

// Create a new task (T2.1)
exports.createTask = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const { title, description } = req.body;
    const task = new Task({
      title,
      description,
      ownerId: req.session.user._id,
      ownerEmail: req.session.user.email,
      volunteers: []
    });

    await task.save();
    taskEvents.emit(EVENT_TYPES.TASK_CREATED, task);

    res.redirect('/requester/dashboard');
  } catch (err) {
    res.status(500).render('requester/create', {
      error: 'Failed to create task: ' + err.message,
      formData: req.body
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).send('Task not found');

    if (task.ownerId.toString() !== req.session.user._id.toString()) {
      return res.status(403).send('Not authorized to delete this task');
    }

    await Task.findByIdAndDelete(req.params.id);
    res.redirect('/requester/dashboard');
  } catch (err) {
    res.status(500).send('Error deleting task: ' + err.message);
  }
};

// List all tasks
exports.listTasks = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    let tasks;
    if (req.session.user.accountType === 'requester') {
      tasks = await Task.find({ ownerId: req.session.user._id });
      res.render('requester/list', { tasks, isOwner: true });
    } else {
      tasks = await Task.find({ volunteers: { $ne: req.session.user.email } });
      res.render('requester/list', { tasks, isOwner: false });
    }
  } catch (err) {
    res.status(500).send('Error fetching tasks: ' + err.message);
  }
};

// Show task details with volunteers (T2.2)
exports.showTaskDetailsForOwner = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).send('Task not found');

    const isOwner = task.ownerId.toString() === req.session.user._id.toString();
    if (!isOwner) return res.status(403).send('Access denied');

    res.render('requester/details', { task });
  } catch (err) {
    res.status(500).send('Error retrieving task: ' + err.message);
  }
};

// Remove volunteer (T2.2)
exports.removeVolunteer = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const { taskId, volunteerEmail } = req.body;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).send('Task not found');

    if (task.ownerId.toString() !== req.session.user._id.toString()) {
      return res.status(403).send('Unauthorized');
    }

    task.volunteers = task.volunteers.filter(email => email !== volunteerEmail);
    await task.save();

    taskEvents.emit(EVENT_TYPES.VOLUNTEER_REMOVED, { task, volunteerEmail });

    // Set flag to notify on next login if the current user is the volunteer
    if (req.session && req.session.user && req.session.user.email === volunteerEmail) {
      req.session.wasDismissed = true;
    }

    res.redirect(`/requester/${taskId}`);
  } catch (err) {
    res.status(500).send('Error removing volunteer: ' + err.message);
  }
};

// Statistics for tasks and volunteers (T8)
exports.getStatistics = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');

    const tasks = await Task.find();
    const totalTasks = tasks.length;
    const totalVolunteersWithDuplicates = tasks.reduce((sum, t) => sum + t.volunteers.length, 0);
    const uniqueVolunteers = new Set();
    tasks.forEach(t => t.volunteers.forEach(v => uniqueVolunteers.add(v)));

    const stats = {
      totalTasks,
      totalVolunteersWithDuplicates,
      uniqueVolunteers: uniqueVolunteers.size,
      averageVolunteersPerTask: totalTasks > 0 ? (totalVolunteersWithDuplicates / totalTasks).toFixed(1) : 0
    };

    res.render('requester/statistics', { stats });
  } catch (err) {
    res.status(500).send('Error generating statistics: ' + err.message);
  }
};

exports.showVolunteerStats = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const tasks = await Task.find({ ownerId: req.session.user._id });

    res.render('requester/stats', { tasks });
  } catch (err) {
    res.status(500).send('Error fetching volunteers: ' + err.message);
  }
};
