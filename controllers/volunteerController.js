// controllers/volunteerController.js
const Task = require('../models/Task');
const { taskEvents, EVENT_TYPES } = require('../utils/observer');

// Show tasks available for volunteering (T3)
exports.showAvailableTasks = async (req, res) => {
  try {
    // if (!req.session.user) {
    //   return res.redirect('/login');
    // }
    const userEmail = req.session.user.email;

    const availableTasks = await Task.find({
      volunteers: { $nin: [userEmail] } // Only tasks where user is NOT already a volunteer
    });
    res.render('volunteer/dashboard', { tasks: availableTasks });
  } catch (err) {
    res.status(500).send('Error fetching available tasks: ' + err.message);
  }
};

// Volunteer for a task (T4)
exports.volunteerForTask = async (req, res) => {
  try {
    // if (!req.session.user) {
    //   return res.redirect('/login');
    // }

    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send('Task not found');
    }

    if (task.status === 'completed') {
      return res.status(400).send('Cannot volunteer for a completed task');
    }

    if (task.volunteers.includes(req.session.user.email)) {
      return res.status(400).send('You have already volunteered for this task');
    }

    task.volunteers.push(req.session.user.email);

    if (task.status === 'open') {
      task.status = 'in-progress';
    }

    await task.save();

    taskEvents.emit(EVENT_TYPES.VOLUNTEER_JOINED, {
      task,
      volunteerEmail: req.session.user.email
    });

    console.log(`[Event] ${EVENT_TYPES.VOLUNTEER_JOINED} -> ${req.session.user.email}`);

    res.redirect('/volunteer/my-tasks');
  } catch (err) {
    res.status(500).send('Error volunteering for task: ' + err.message);
  }
};

// Show tasks user has volunteered for (T4 View + Notification)
exports.showMyTasks = async (req, res) => {
  try {
    // if (!req.session.user) return res.redirect('/login');

    const tasks = await Task.find({ volunteers: req.session.user.email });

    let message = null;
    if (req.session.dismissedVolunteers?.[req.session.user.email]) {
      message = 'You were removed from one or more tasks.';
      delete req.session.dismissedVolunteers[req.session.user.email];
    }

    res.render('volunteer/my-tasks', { tasks, message });
  } catch (err) {
    res.status(500).send('Error loading tasks: ' + err.message);
  }
};

// Withdraw from a task
exports.withdraw = async (req, res) => {
  try {
    // if (!req.session.user) {
    //   return res.redirect('/login');
    // }

    const taskId = req.params.id;
    const userEmail = req.session.user.email;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send('Task not found');
    }

    task.volunteers = task.volunteers.filter(email => email !== userEmail);
    await task.save();

    res.redirect('/volunteer/my-tasks');
  } catch (err) {
    console.error('❌ Error withdrawing from task:', err);
    res.status(500).send('Error withdrawing from task: ' + err.message);
  }
};

// Observer hook example (can be used for logging or analytics)
if (!taskEvents.listenerCount(EVENT_TYPES.VOLUNTEER_REMOVED)) {
  taskEvents.on(EVENT_TYPES.VOLUNTEER_REMOVED, ({ volunteerEmail }) => {
    console.log(`[Observer] Volunteer removed: ${volunteerEmail}`);
  });
}
