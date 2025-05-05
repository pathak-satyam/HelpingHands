const User = require('../models/User');

exports.showLogin = (req, res) => {
  const error = req.query.error === '403' ? 'Invalid email or password' : null;
  res.render('login', { error, formData: {} });
};

exports.showRegister = (req, res) => {
  res.render('register');
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password }).select('-password');
  if (user) {
    req.session.user = user;

    if (user.accountType == 'requester') {
      res.redirect('/requester/dashboard')
    } else {
      res.redirect('/volunteer/dashboard');
    }
  } else {
    res.redirect('/login?error=403');
  }
};

exports.register = async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  const user = new User(req.body);
  await user.save();
  res.redirect('/login');
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};
