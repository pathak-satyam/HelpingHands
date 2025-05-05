const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose'); // needed for ObjectId

const db = require('./utils/db');
const methodOverride = require('method-override');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const MongoStore = require('connect-mongo');

const app = express(); // ✅ MUST BE DECLARED FIRST

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // Same as your MongoDB URI
    collectionName: 'sessions',
    ttl: 1000 * 60 * 60 * 24, // 1 day
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false, // true if using HTTPS
    httpOnly: true
  }
}));

app.set('views', path.join(__dirname, 'views')); // Path to your views directory
app.set('view engine', 'ejs'); // Or whatever engine you're using (pug, hbs, etc.)

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

app.use(methodOverride('_method'));

app.use('/', authRoutes);
app.use('/requester', taskRoutes);
app.use('/volunteer', volunteerRoutes);
app.use('/tasks', taskRoutes);
// Connect to MongoDB
(async () => {
  try {
    await db.connect(); // Singleton connect method
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
})();
