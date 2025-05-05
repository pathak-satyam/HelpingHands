const EventEmitter = require('events');

class TaskObserver extends EventEmitter {}

const taskEvents = new TaskObserver();

const EVENT_TYPES = {
  TASK_CREATED: 'TASK_CREATED',
  VOLUNTEER_REMOVED: 'VOLUNTEER_REMOVED',
  VOLUNTEER_SUBSCRIBED: 'VOLUNTEER_SUBSCRIBED'
};

module.exports = { taskEvents, EVENT_TYPES };
taskEvents.on(EVENT_TYPES.VOLUNTEER_REMOVED, ({ task, volunteerEmail }) => {
  console.log(`[Observer] Volunteer ${volunteerEmail} removed from task ${task.title}`);

});