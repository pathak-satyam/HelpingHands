const EventEmitter = require('events');

class TaskEventEmitter extends EventEmitter {}

// Create a singleton instance of the emitter
const taskEvents = new TaskEventEmitter();

// Event types
const EVENT_TYPES = {
  TASK_CREATED: 'task_created',
  VOLUNTEER_JOINED: 'volunteer_joined',
  VOLUNTEER_REMOVED: 'volunteer_removed',
  TASK_COMPLETED: 'task_completed'
};

module.exports = { taskEvents, EVENT_TYPES };