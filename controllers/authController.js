const User = require('../models/User');

exports.showLogin = (req, res) => {
  const error = req.query.error === '403' ? 'Invalid email or password' : null;
  res.render('login', { error, formData: {} });
};

exports.showRegister = (req, res) => {
  res.render('register', { error: null, formData: {} });
};

exports.login = async (req, res) => {
  const { email, password, userType } = req.body;

  if (userType === 'volunteer') {
    req.session.user = new User();
    req.session.user.email = email;
    res.redirect('/volunteer/dashboard');
  } else {
    const user = await User.findOne({ email, password }).select('-password');
    if (user) {
      req.session.user = user;
      if (user.accountType === 'requester') {
        res.redirect('/requester/dashboard');
      } else {
        res.redirect('/volunteer/dashboard');
      }
    } else {
      res.redirect('/login?error=403');
    }
  }
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, zipCode } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).render('register', {
        error: 'Passwords do not match.',
        formData: req.body
      });
    }

    const profileImage = req.file ? req.file.filename : null;

    const user = new User({
      fullName,
      email,
      password, // hash this if needed
      zipCode,
      accountType: 'requester',
      profileImage
    });

    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(400).render('register', {
      error: 'Registration failed.',
      formData: req.body
    });
  }
};


exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};
