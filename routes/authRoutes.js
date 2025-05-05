const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', (req, res) => {
  res.redirect('/login')
})

router.get('/login', authController.showLogin);
router.post('/login', authController.login);

router.get('/register', authController.showRegister);
router.post('/register', authController.register);

router.get('/logout', authController.logout);

console.log('Auth Routes imported')

module.exports = router;
