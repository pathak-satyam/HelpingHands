const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./utils/db');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session management
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 1000 * 60 * 60 * 24
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: false,
    httpOnly: true
  }
}));

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Logger
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/requester', taskRoutes);
app.use('/volunteer', volunteerRoutes);
app.use('/tasks', taskRoutes);

// Connect to MongoDB and start server
(async () => {
  try {
    await db.connect();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
})();
