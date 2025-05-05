const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/dashboard', taskController.listTasks);

router.get('/create', taskController.showCreateTask);
router.post('/create', taskController.createTask);

router.get('/lists', taskController.listTasks)
router.get('/statistics', taskController.showVolunteerStats);

router.post('/requester/remove-volunteer', taskController.removeVolunteer);
router.post('/remove-volunteer', taskController.removeVolunteer);

router.get('/:id', taskController.showTaskDetailsForOwner);
router.delete('/:id', taskController.deleteTask);
module.exports = router;
