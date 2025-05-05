// utils/db.js
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Singleton class for database connection
 * Implements requirement T7: Singleton pattern for database access
 */
class Database {
  constructor() {
    // If an instance already exists, return it
    if (Database.instance) {
      return Database.instance;
    }
    
    // Database configuration
    this.mongoURI = process.env.MONGO_URI;
    
    // Store the instance
    Database.instance = this;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise} Mongoose connection
   */
  async connect() {
    try {
      if (this.connection) {
        console.log('✅ Using existing database connection');
        return this.connection;
      }

      // Connect to MongoDB
      await mongoose.connect(this.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      this.connection = mongoose.connection;
      console.log('✅ MongoDB connected through Singleton');
      
      // Handle connection errors after initial connection
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });
      
      return this.connection;
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
      process.exit(1);
    }
  }
  
  /**
   * Get the database connection
   * @returns {Object} Mongoose connection
   */
  getConnection() {
    return this.connection;
  }
  
  /**
   * Close the database connection
   * @returns {Promise}
   */
  async close() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      console.log('✅ MongoDB disconnected');
    }
  }
}

// Create and freeze a singleton instance
const instance = new Database();

module.exports = instance;