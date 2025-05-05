const express = require('express');
const router = express.Router();
const volunterController = require('../controllers/volunteerController')

router.get('/dashboard', volunterController.showAvailableTasks);

router.get('/my-tasks', volunterController.showMyTasks);
router.post('/tasks/:id/volunteer', volunterController.volunteerForTask);
router.post('/tasks/:id/withdraw', volunterController.withdraw)

module.exports = router;
